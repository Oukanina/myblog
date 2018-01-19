// function binaryAnd(a, b) {
//   // eslint-disable-next-line
//   return parseInt(a, 2) & parseInt(b, 2);
// }

// eslint-disable-next-line
// export async function hasWritePermission(user, file) {
//   // owner
//   if (file.userId === user.id) {
//     const m = file.mode.split('')[0];
//     const code = Number(m).toString(2);
//     return Boolean(code);
//   }
//
//   // same group
//   // const groups = await user.getGroups();
//   // const owner = await file.getOwner();
//   const [groups, owner] = await Promise.all([
//     user.getGroups(), file.getOwner(),
//   ])
//   const ownerGroups = await owner.getGroups();
//
// }

// eslint-disable-next-line
export function canDeleteFile(user, file) {
  //   // owner
  return file.userId === user.id;
}
