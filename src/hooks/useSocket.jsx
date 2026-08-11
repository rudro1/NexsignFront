import { useCallback } from 'react';

export default function useSocket() {
  const noop    = useCallback(() => () => {}, []);
  const noopArr = useCallback(() => {},        []);

  return {
    socket:        null,
    connected:     false,
    on:            noop,
    off:           noopArr,
    emit:          noopArr,
    joinDocument:  noopArr,
    leaveDocument: noopArr,
    joinTemplate:  noopArr,
    joinOwner:     noopArr,
  };
}