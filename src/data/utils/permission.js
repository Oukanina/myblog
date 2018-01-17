// eslint-disable-next-line
export function hasWritePermission(user, file) {
  // owner
  if (file.userId === user.id) {
    const m = file.mode.split('')[0];
    const code = Number(m).toString(2);
    return Boolean(code && '010');
  }

  // same group
  // if ()
}
