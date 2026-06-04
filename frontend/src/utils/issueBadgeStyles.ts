export function getStatusClass(status: string) {
  if (status === 'TODO') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  if (status === 'IN_PROGRESS') {
    return 'border-[#d8dcff] bg-[#eef0ff] text-[#5e6ad2]';
  }

  if (status === 'DONE') {
    return 'border-green-200 bg-green-50 text-green-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

export function getPriorityClass(priority: string) {
  if (priority === 'LOW') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  if (priority === 'MEDIUM') {
    return 'border-yellow-200 bg-yellow-50 text-yellow-700';
  }

  if (priority === 'HIGH') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}

export function getTypeClass(type: string) {
  if (type === 'BUG') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (type === 'FEATURE') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  if (type === 'TASK') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  return 'border-slate-200 bg-slate-100 text-slate-700';
}
