type BatchEntry = {
    resolver: string;
    params: unknown;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
};

let batchQueue: BatchEntry[] = [];
let scheduled = false;

function flush(): void {
    scheduled = false;
    const queue = batchQueue;
    batchQueue = [];

    if (queue.length === 0) return;

    fetch('/resolver/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            batch: queue.map(({ resolver, params }) => ({ resolver, params })),
        }),
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(await response.text());
            }
            return response.json() as Promise<unknown[]>;
        })
        .then((results: unknown[]) => {
            queue.forEach((entry, index) => {
                entry.resolve(results[index]);
            });
        })
        .catch((error: unknown) => {
            queue.forEach((entry) => {
                entry.reject(error);
            });
        });
}

function scheduleFlush(): void {
    if (scheduled) return;
    scheduled = true;
    setTimeout(flush, 0);
}

export function enqueueResolverCall<Params, Result>(resolver: string, params: Params): Promise<Result> {
    return new Promise<Result>((resolve, reject) => {
        batchQueue.push({
            resolver,
            params,
            resolve: resolve as (value: unknown) => void,
            reject,
        });
        scheduleFlush();
    });
}
