import { useEffect, useState } from "react";

const useCountdown = (targetDate, dependencies = []) => {
  const countDownDate = new Date(targetDate).getTime();
  const totalTime = countDownDate - new Date().getTime();

  const [countDown, setCountDown] = useState(totalTime);

  useEffect(() => {
    setCountDown(totalTime);
  }, [targetDate, ...dependencies]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountDown((prevCountDown) => {
        const newCountDown = prevCountDown - 1000; // Subtract 1 second (1000 ms)
        return newCountDown >= 0 ? newCountDown : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return getReturnValues(countDown, totalTime);
};

const getReturnValues = (countDown, totalTime) => {
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  const milliseconds = countDown % 1000;

  const elapsedTime = totalTime - countDown;
  const progressPercentage = (elapsedTime / totalTime) * 100;

  return [days, hours, minutes, seconds, milliseconds, progressPercentage];
};

export { useCountdown };
