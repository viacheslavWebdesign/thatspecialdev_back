import { __ } from "@wordpress/i18n";
import { useBlockProps, RichText } from "@wordpress/block-editor";
import { useState, useEffect } from "react";

export default function Edit({ attributes, setAttributes }) {
  const { title, buttonText } = attributes;
  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const checkRequiredFields = () => {
    const errors = [];

    if (!title) {
      errors.push({
        field: "title",
        message: __("Title is required", "errorpage"),
      });
    }

    if (!buttonText) {
      errors.push({
        field: "buttonText",
        message: __("Button text is required", "errorpage"),
      });
    }

    setErrorMessages(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  useEffect(() => {
    checkRequiredFields();
  }, [title, buttonText]);

  useEffect(() => {
    if (!isValid) {
      window.wp.data
        .dispatch("core/editor")
        .lockPostSaving("required-fields-error");
    } else {
      window.wp.data
        .dispatch("core/editor")
        .unlockPostSaving("required-fields-error");
    }
  }, [isValid]);

  useEffect(() => {
    return () => {
      window.wp.data
        .dispatch("core/editor")
        .unlockPostSaving("required-fields-error");
    };
  }, []);

  return (
    <div {...useBlockProps()}>
      <div className="custom-block">
        <div>
          <RichText
            tagName="h2"
            value={attributes.title}
            onChange={(value) => setAttributes({ title: value })}
            placeholder="Enter title"
            allowedFormats={["core/italic"]}
          />
          {errorMessages.some((error) => error.field === "title") && (
            <div className="custom-block-error">
              {__("Title is required", "errorpage")}
            </div>
          )}
        </div>
        <div className="custom-block-button">
          <RichText
            tagName="p"
            value={attributes.buttonText}
            onChange={(value) => setAttributes({ buttonText: value })}
            placeholder="Enter button text"
            allowedFormats={[]}
          />
          {errorMessages.some((error) => error.field === "buttonText") && (
            <div className="custom-block-error">
              {__("Button text is required", "errorpage")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
