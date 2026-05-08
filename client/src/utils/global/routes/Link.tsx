import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type LinkProps = Exclude<React.ComponentProps<typeof RouterLink>, 'reloadDocument'>;

export const Link: React.FC<LinkProps> = (props) => <Link reloadDocument {...props} />;
