const bus = new BroadcastChannel('auth')
export const notifyLogout = () => bus.postMessage({ type: 'logout' })
export const onLogout = (cb: () => void) =>
    bus.addEventListener('message', e => e.data?.type === 'logout' && cb())