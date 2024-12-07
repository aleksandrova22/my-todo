import { memo } from 'react';

export const Button = memo(function ({ action, children }) {
  console.debug('Button render', children);
  return <button data-action={action} >{children}</button>
});