import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PROGRAM_ID } from "streamnft-sol-test/build/constants";
import { utilityAxiosInstance } from "@/services/axios";

export const getRate = (timeScaleLocal, rateLocal) => {
  let value = 0;
  if (timeScaleLocal === "Hours") {
    value = 2;
  } else if (timeScaleLocal === "Minutes") {
    value = 1;
  } else if (timeScaleLocal === "Days") {
    value = 3;
  } else if (timeScaleLocal === "Weeks") {
    value = 4;
  } else if (timeScaleLocal === "Months") {
    value = 5;
  } else if (timeScaleLocal === "Years") {
    value = 6;
  }
  rateLocal = rateLocal * LAMPORTS_PER_SOL * 60;
  switch (value) {
    case 1:
      //minutes
      return rateLocal / 60;
    case 2:
      //hours
      return rateLocal / 3600;
    case 3:
      //days
      return rateLocal / 86400;
    case 4:
      //weeks
      return rateLocal / 604800;
    case 5:
      //months
      return rateLocal / 2592000;
    case 6:
      //years
      return rateLocal / 31536000;
    default:
      return rateLocal;
  }
};

export const getHederaRate = (timeScaleLocal, rateLocal) => {
  let value = 0;
  if (timeScaleLocal === "Hours") {
    value = 2;
  } else if (timeScaleLocal === "Minutes") {
    value = 1;
  } else if (timeScaleLocal === "Days") {
    value = 3;
  } else if (timeScaleLocal === "Weeks") {
    value = 4;
  } else if (timeScaleLocal === "Months") {
    value = 5;
  } else if (timeScaleLocal === "Years") {
    value = 6;
  }
  rateLocal = rateLocal * 60;
  switch (value) {
    case 1:
      //minutes
      return rateLocal / 60;
    case 2:
      //hours
      return rateLocal / 3600;
    case 3:
      //days
      return rateLocal / 86400;
    case 4:
      //weeks
      return rateLocal / 604800;
    case 5:
      //months
      return rateLocal / 2592000;
    case 6:
      //years
      return rateLocal / 31536000;
    default:
      return rateLocal;
  }
};

export const getEVMRate = (timeScaleLocal, rateLocal) => {
  let value = 0;

  if (timeScaleLocal === "Hours") {
    value = 2;
  } else if (timeScaleLocal === "Minutes") {
    value = 1;
  } else if (timeScaleLocal === "Days") {
    value = 3;
  } else if (timeScaleLocal === "Weeks") {
    value = 4;
  } else if (timeScaleLocal === "Months") {
    value = 5;
  } else if (timeScaleLocal === "Years") {
    value = 6;
  }

  switch (value) {
    case 1:
      // minutes
      return rateLocal / 60;
    case 2:
      // hours
      return rateLocal / 3600;
    case 3:
      // days
      return rateLocal / 86400;
    case 4:
      // weeks
      return rateLocal / 604800;
    case 5:
      // months
      return rateLocal / 2592000;
    case 6:
      // years
      return rateLocal / 31536000;
    default:
      console.warn("Unexpected timeScaleLocal:", timeScaleLocal);
      return rateLocal;
  }
};

export const getErcRate = (timeScaleLocal, rateLocal) => {
  let value = 0;

  if (timeScaleLocal === "Hours") {
    value = 2;
  } else if (timeScaleLocal === "Minutes") {
    value = 1;
  } else if (timeScaleLocal === "Days") {
    value = 3;
  } else if (timeScaleLocal === "Weeks") {
    value = 4;
  } else if (timeScaleLocal === "Months") {
    value = 5;
  } else if (timeScaleLocal === "Years") {
    value = 6;
  }

  switch (value) {
    case 1:
      // minutes
      return rateLocal;
    case 2:
      // hours to minutes
      return rateLocal * 60;
    case 3:
      // days to minutes
      return rateLocal * 1440; // 24 hours * 60 minutes
    case 4:
      // weeks to minutes
      return rateLocal * 10080; // 7 days * 1440 minutes
    case 5:
      // months to minutes
      return rateLocal * 43200; // 30 days * 1440 minutes (approximation)
    case 6:
      // years to minutes
      return rateLocal * 525600; // 365 days * 1440 minutes
    default:
      console.warn("Unexpected timeScaleLocal:", timeScaleLocal);
      return rateLocal;
  }
};

export const getSeconds = (timeScaleLocal, rateLocal) => {
  let value = timeScaleLocal;
  if (timeScaleLocal === "Hours") {
    value = 2;
  } else if (timeScaleLocal === "Minutes") {
    value = 1;
  } else if (timeScaleLocal === "Days") {
    value = 3;
  } else if (timeScaleLocal === "Weeks") {
    value = 4;
  } else if (timeScaleLocal === "Months") {
    value = 5;
  } else if (timeScaleLocal === "Years") {
    value = 6;
  }
  switch (value) {
    case 1:
      //minutes
      return rateLocal * 60;
    case 2:
      //hours
      return rateLocal * 3600;
    case 3:
      //days
      return rateLocal * 86400;
    case 4:
      //weeks
      return rateLocal * 604800;
    case 5:
      //months
      return rateLocal * 2592000;
    case 6:
      //years
      return rateLocal * 31536000;
    default:
      return rateLocal;
  }
};

export const getMinutes = (timeScaleLocal, rateLocal) => {
  let value = timeScaleLocal;
  if (timeScaleLocal === "Hours") {
    value = 2;
  } else if (timeScaleLocal === "Minutes") {
    value = 1;
  } else if (timeScaleLocal === "Days") {
    value = 3;
  } else if (timeScaleLocal === "Weeks") {
    value = 4;
  } else if (timeScaleLocal === "Months") {
    value = 5;
  } else if (timeScaleLocal === "Years") {
    value = 6;
  }
  switch (value) {
    case 1:
      //minutes
      return rateLocal;
    case 2:
      //hours
      return rateLocal * 60;
    case 3:
      //days
      return rateLocal * 1440;
    case 4:
      //weeks
      return rateLocal * 10080;
    case 5:
      //months
      return rateLocal * 43800;
    case 6:
      //years
      return rateLocal * 525600;
    default:
      return rateLocal;
  }
};

export const scaleConvertion = (timeScaleLocal) => {
  if (timeScaleLocal === "Minutes") {
    return 1;
  } else if (timeScaleLocal === "Hours") {
    return 2;
  } else if (timeScaleLocal === "Days") {
    return 3;
  } else if (timeScaleLocal === "Weeks") {
    return 4;
  } else if (timeScaleLocal === "Months") {
    return 5;
  } else if (timeScaleLocal === "Years") {
    return 6;
  } else {
    return 0;
  }
};

export const timeString = (time) => {
  //time = time*60;
  let d = 0;
  let h = 0;
  let m = 0;
  let s = 0;
  let rs = "";
  if (time / 86400 > 0) {
    d = Math.floor(time / 86400);
    time = time % 86400;
    //rs += d + ":D ";
  }
  if (time / 3600 > 0) {
    h = Math.floor(time / 3600);
    time = time % 3600;
    //rs += h + ":H ";
  }
  if (time / 60 > 0) {
    m = Math.floor(time / 60);
    s = time % 60;
    //rs += m + ":M " +s + ":S";
  }
  if (d > 0) {
    rs += d + ":D ";
  }
  if (h > 0) {
    rs += h + ":H ";
  }
  if (m > 0) {
    rs += m + ":M ";
  }
  if (s > 0) {
    rs + s + ":S";
  }
  return rs;
};

export const getDuration = (time) => {
  let d = 0;
  let h = 0;
  let m = 0;
  let s = 0;
  let result = "";
  if (time / 86400 >= 1) {
    d = Math.floor(time / 86400);
    time = time % 86400;
    result += d + " Days ";
  }
  if (time / 3600 >= 1) {
    h = Math.floor(time / 3600);
    time = time % 3600;
    result += h + " Hours ";
  }
  if (time / 60 >= 1) {
    m = Math.floor(time / 60);
    s = time % 60;
    result += m + " Minutes ";
  }
  if (s > 0) {
    result += s + " Seconds";
  }
  return result;
};

export const getTimeForCard = (time) => {
  let d = 0;
  let h = 0;
  let m = 0;
  let result = "";
  if (time / 86400 >= 1) {
    d = Math.floor(time / 86400);
    time = time % 86400;
    result += d + " D ";
  }
  if (time / 3600 >= 1) {
    h = Math.floor(time / 3600);
    time = time % 3600;
    result += h + " H ";
  }
  if (time / 60 >= 1) {
    m = Math.floor(time / 60);
    time = time % 60;
    result += m + " M";
  }
  if (time > 0) {
    result += time + " S";
  }
  if (result === "") {
    return "0S";
  }
  return result;
};

export const getNearestTime = (time) => {
  let d = 0;
  let h = 0;
  let m = 0;
  let result = "";
  if (time / 86400 >= 1) {
    d = Math.floor(time / 86400);
    return d + " D ";
  }
  if (time / 3600 >= 1) {
    h = Math.floor(time / 3600);
    return h + " H ";
  }
  if (time / 60 >= 1) {
    time = time % 60;
    return m + " M";
  }
  if (time > 0) {
    return time + " S";
  }
  if (result === "") {
    return "0S";
  }
  return result;
};

export const getCardMaxTime = (time) => {
  let timeLeft = "";
  let now = new Date();

  var startOfDay = Math.floor(now / 1000);
  if (time < startOfDay) {
    return "0S";
  }
  var left = time - startOfDay;
  timeLeft = getNearestTime(left);
  return timeLeft;
};

export const getMaxTimeInSecond = (time) => {
  let timeLeft = "";
  let now = new Date();

  var startOfDay = Math.floor(now / 1000);
  if (time < startOfDay) {
    return "0";
  }
  var left = time - startOfDay;
  //var date = new Date(left*1000);
  return left;
};
export const getRatePerHour = (rate) => {
  return (rate * 60).toFixed(5);
};

export const calculateProfit = (rate, maxTime) => {
  if ((rate > 0, maxTime > 0)) {
    return (rate * maxTime * 60).toFixed(3);
  }
  return 0;
};

export const totalTimeLeft = (time) => {
  let timeLeft = "";
  let now = new Date();

  var startOfDay = Math.floor(now / 1000);
  if (time < startOfDay) {
    return "0S";
  }
  var left = time - startOfDay;
  //var date = new Date(left*1000);
  return left;
};

export const expiryTime = (time) => {
  let timeLeft = "";
  let now = new Date();

  var startOfDay = Math.floor(now / 1000);
  if (time < startOfDay) {
    return "0S";
  }
  var left = time - startOfDay;
  //var date = new Date(left*1000);
  timeLeft = timeString(left);
  return timeLeft;
};

export const sortarrayAsc = (arr, type, sortFor) => {
  console.log({ arr });
  if (type === "p") {
    return arr?.sort((a, b) => {
      return sortFor === "mart"
        ? parseFloat(a?.saleprice) - parseFloat(b?.saleprice)
        : parseFloat(a?.rentState?.rate) - parseFloat(b?.rentState?.rate);
    });
  } else if (type === "d") {
    return arr.sort((a, b) => {
      const timeA = parseTimeLeft(a.timeLeft);
      const timeB = parseTimeLeft(b.timeLeft);
      return timeA - timeB;
    });
  }
};

export const sortarrayDes = (arr, type, sortFor) => {
  if (type === "p") {
    return arr?.sort((a, b) => {
      return sortFor === "mart"
        ? parseFloat(b?.saleprice) - parseFloat(a?.saleprice)
        : parseFloat(b?.rentState?.rate) - parseFloat(a?.rentState?.rate);
    });
  } else if (type === "d") {
    return arr.sort((a, b) => {
      const timeA = parseTimeLeft(a.timeLeft);
      const timeB = parseTimeLeft(b.timeLeft);
      return timeB - timeA;
    });
  }
};

export const searchArray = (str, arr) => {
  const res = arr.filter(
    (a) =>
      a?.name?.toLowerCase().includes(str.toLowerCase()) ||
      a?.tokenId?.toString().includes(str.replace("#", "").toLowerCase())
  );
  return res;
};

export const filterArray = (val, arr) => {
  return arr;
};

const parseTimeLeft = (timeLeftStr) => {
  timeLeftStr = timeLeftStr?.trim();

  const components = timeLeftStr?.split(/[ :]/);

  let days = 0;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  for (let i = 0; i < components?.length; i += 2) {
    const value = parseInt(components[i]);
    const unit = components[i + 1];

    if (isNaN(value)) {
      continue;
    }

    if (unit === "D") {
      days = value;
    } else if (unit === "H") {
      hours = value;
    } else if (unit === "M") {
      minutes = value;
    } else if (unit === "S") {
      seconds = value;
    }
  }

  const totalSeconds =
    days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;

  return totalSeconds;
};

// hedera testnet contract in accountId format
export const url =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api-dev.danlabs.xyz";

export const solanaTestnet = 0;
export const solanaContractAddress = PROGRAM_ID;

export const getSolanaCollectionArray = async () => {
  const resp = await fetch(
    `${url}/collection/${solanaTestnet}/${solanaContractAddress}`
  ).then((r) => {
    r = r.json();
    return r;
  });
  return resp;
};

const parseTimeString = (timeString) => {
  const parts = timeString.split(" ");
  let days = 0;
  let hours = 0;
  let minutes = 0;

  parts.forEach((part) => {
    const [value, unit] = part.split(":");
    if (unit === "D") {
      days = parseInt(value);
    } else if (unit === "H") {
      hours = parseInt(value);
    } else if (unit === "M") {
      minutes = parseInt(value);
    }
  });

  return { days, hours, minutes };
};

export const calculateTimeDifference = (timeString1, timeString2) => {
  const time1 = parseTimeString(timeString1);
  const time2 = parseTimeString(timeString2);

  const totalMinutes1 = time1.days * 24 * 60 + time1.hours * 60 + time1.minutes;
  const totalMinutes2 = time2.days * 24 * 60 + time2.hours * 60 + time2.minutes;

  const differenceInMinutes = Math.abs(totalMinutes1 - totalMinutes2);

  const days = Math.floor(differenceInMinutes / (24 * 60));
  const hours = Math.floor((differenceInMinutes % (24 * 60)) / 60);
  const minutes = differenceInMinutes % 60;

  return `${days}:D ${hours}:H ${minutes}:M`;
};

export const fetchTokenUtilityByCollection = async (collection, chainId) => {
  try {
    const response = await utilityAxiosInstance.get(
      `/utility/token-utility/${chainId}/${collection}`
    );

    return response?.data;
  } catch (error) {
    console.error("Failed to fetch token utility:", error);
    return null;
  }
};

export function removeQuery(url) {
  return url?.replace(/\?.*$/, "");
}
