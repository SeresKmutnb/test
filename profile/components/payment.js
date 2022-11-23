import React, { useState } from "react";
import Script from "react-load-script";

let OmiseCard

export default function CreditCard() {
    const handleLoadScript = () => {
        OmiseCard = window.OmiseCard
        OmiseCard.configure({
            publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
            currency: 'THB',
            frameLabel: 'PTBookShop',
            submitLabel: 'Pay NOW',
            buttonLabel: 'Pay with Omise'
   });
}

const creditCardConfigure = () => {
    OmiseCard.configure({
        defaultPaymentMethod: 'credit_card',
        otherPaymentMethods: []
    });
    OmiseCard.configureButton("#credit-card");
    OmiseCard.attach();
}

const omiseCardHandler = () => {
        OmiseCard.open({
            amount: "1000",
            onCreateTokenSuccess: (token) => {
                Axios.post(`api url`, {
                    email: "s6203051623013@email.kmutnb.ac.th",
                    name: 'PTBookShop',
                    amount: "1000",
                    token: token,
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            },
            onFormClosed: () => { },
      })
}

const handleClick = (e) => {
    e.preventDefault();
    creditCardConfigure();
    omiseCardHandler()
}




return (
    <div className="own-form">
        <Script
            url="https://cdn.omise.co/omise.js"
            onLoad={handleLoadScript}
        />
        <form>
            <div id="credit-card">
                <button onClick={handleClick}>ชำระเงินด้วยบัตรเครดิต</button>
            </div>
        </form>
    </div>
 )
}
