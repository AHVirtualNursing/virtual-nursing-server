function getBedsPerRoom(wardType) {
  switch (wardType) {
    case "A1":
      return 1;
    case "B1":
      return 4;
    case "B2":
      return 5;
    case "C":
      return 5;
  }
}

module.exports = { getBedsPerRoom };
