import type { NodeStatus } from '~/lib/api/types.gen'

export const getNodeStatusClass = (status: NodeStatus) => {
  switch (status) {
    case 'online':
      return 'bg-green-500'
    case 'unstable':
      return 'bg-amber-400'
    case 'pending':
      return 'bg-sky-500'
    case 'offline':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

export const getNodeStatusLabel = (status: NodeStatus) => {
  switch (status) {
    case 'online':
      return 'Online'
    case 'unstable':
      return 'Unstable'
    case 'pending':
      return 'Pending'
    case 'offline':
      return 'Offline'
    default:
      return status
  }
}
