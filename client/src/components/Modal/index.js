import React, { useState, useEffect, useRef } from "react";

import './modal.css';

const Modal = ({ onClose, onStartgame, title }) => {
    // Use useEffect to add an event listener to the document
    useEffect(() => {
        function onKeyDown(event) {
            if (event.keyCode === 27) {
                // Close the modal when the Escape key is pressed
                onClose();
            }
        }

        // Prevent scolling
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);

        // Clear things up when unmounting this component
        return () => {
            document.body.style.overflow = "visible";
            document.removeEventListener("keydown", onKeyDown);
        };
    });

    return (
        <div className="modal__backdrop">
            <div className="modal__container">
                <h3 className="modal__title">Game Started!</h3>
                <p className="modal__content">
                    {title} started by opponent. Please join the game!!
                </p>
                <button type="button" onClick={onStartgame}>
                    Start game
                </button>

                <button type="button" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Modal;