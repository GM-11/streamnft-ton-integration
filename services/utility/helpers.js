export function wait(seconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

export const customLoader = ({ src }) => {
  return src;
};
