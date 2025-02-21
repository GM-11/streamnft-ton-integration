import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled from "styled-components";

const CustomToast = styled(ToastContainer)`
  width: 400px;

  > div {
    height: 100px;
    width: 100%;
    border: 1px solid transparent;
    border-radius: 16px;
    box-shadow: 0 2px 2px #ffffff00, 0 0 4px #ffffff2f;
    font-family: "Poppins", sans-serif;
    font-weight: 500;
    font-size: 1rem;
    color: #ffffff;
    align-items: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    border: 0;
    overflow: visible;

    .Toastify__close-button {
      color: #ffffff;
      align-self: center;
      position: absolute;
      top: -10px;
      right: -10px;
      background: #c81912;
      padding: 0.8rem;
      border-radius: 50%;
      opacity: 1;
    }
  }

  .Toastify__toast--success {
    background-image: url("/images/toast-green-bg.png");

    .Toastify__close-button {
      background: #026200;
    }
  }

  .Toastify__toast--error {
    background-image: url("/images/toast-red-bg.png");

    .Toastify__close-button {
      background: #c81912;
    }
  }
`;

const Toast = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CustomToast autoClose={2000} icon={false} hideProgressBar={true} />
    </>
  );
};

export default Toast;
