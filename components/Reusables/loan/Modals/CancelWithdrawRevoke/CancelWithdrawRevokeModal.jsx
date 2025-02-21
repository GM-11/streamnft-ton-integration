import React from "react";
import Modal from "../Modal";
import * as Styles from "./styles";
//named styles file diffrently because of the long name

const WithdrawModal = () => {
  return (
    <Modal headerText="Withdraw Details" buttonText="Withdraw">
      <Styles.Wrapper>
        <img src="/images/gun.png" alt="" />
        <div className="content-section">
          <div className="content-row">
            <h5>Contract Type</h5>
            <p>Fixed price</p>
          </div>
          <div className="content-row">
            <h5>Duration</h5>
            <p>10 Days</p>
          </div>
          <div className="content-row">
            <h5>Rent Price</h5>
            <p>SOL 0.78 / Hour</p>
          </div>
          <div className="content-row">
            <h5>Available for </h5>
            <p>XD: YH: ZM: AS </p>
          </div>
          <div className="content-row">
            <h5>Total Rental period </h5>
            <p>XD: YH: ZM: AS</p>
          </div>
          <div className="content-row">
            <h5>Total Profits </h5>
            <p>SOL XYZ</p>
          </div>
        </div>
      </Styles.Wrapper>
    </Modal>
  );
};
const CancelModal = () => {
  return (
    <Modal headerText="Cancel Details" buttonText="Cancel">
      <Styles.Wrapper>
        <img src="/images/gun.png" alt="" />

        <div className="content-section">
          <div className="content-row">
            <h5>Contract Type</h5>
            <p>Fixed price</p>
          </div>
          <div className="content-row">
            <h5>Duration</h5>
            <p>10 Days</p>
          </div>
          <div className="content-row">
            <h5>Rent Price</h5>
            <p>SOL 0.78 / Hour</p>
          </div>
          <div className="content-row">
            <h5>Available for </h5>
            <p>XD: YH: ZM: AS </p>
          </div>
          <div className="content-row">
            <h5>Rental Time Left </h5>
            <p>XD: YH: ZM: AS</p>
          </div>
          <div className="content-row">
            <h5>Total Profits </h5>
            <p>SOL XYZ</p>
          </div>
        </div>
      </Styles.Wrapper>
    </Modal>
  );
};
const RevokeModal = () => {
  return (
    <Modal headerText="Revoke Details" buttonText="Revoke">
      <Styles.Wrapper>
        <img src="/images/gun.png" alt="" />

        <div className="content-section">
          <div className="content-row">
            <h5>Contract Type</h5>
            <p>Fixed price</p>
          </div>
          <div className="content-row">
            <h5>Duration</h5>
            <p>10 Days</p>
          </div>
          <div className="content-row">
            <h5>Rent Price</h5>
            <p> 40% : 60% ( Owner : Renter )</p>
          </div>
          <div className="content-row">
            <h5>Available for </h5>
            <p>XD: YH: ZM: AS </p>
          </div>
          <div className="content-row">
            <h5>Rental Period </h5>
            <h5>XD: YH: ZM: AS</h5>
          </div>
          <div className="content-row">
            <h5>Revenue Generated </h5>
            <p>SOL XYZ</p>
          </div>
        </div>
      </Styles.Wrapper>
    </Modal>
  );
};

export { WithdrawModal, CancelModal, RevokeModal };
