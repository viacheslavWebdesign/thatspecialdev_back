import { __ } from "@wordpress/i18n";
import {
  MediaUpload,
  MediaUploadCheck,
  RichText,
  useBlockProps,
} from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useState, useEffect } from "react";

const Edit = ({ attributes, setAttributes }) => {
  // Дефолтные значения для атрибутов
  const {
    slides = [],
    details = { image: { url: "", alt: "" }, requisites: [] },
  } = attributes;

  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const checkRequiredFields = () => {
    const errors = [];

    if (!details.image?.url) {
      errors.push({
        field: "details-image",
        message: __("Image is required", "contacts"),
      });
    }

    if (!details.requisites?.length) {
      errors.push({
        field: "details-requisites",
        message: __("At least one requisite is required", "contacts"),
      });
    }

    details.requisites?.forEach((requisite, index) => {
      if (!requisite.type) {
        errors.push({
          field: `requisite-${index}-type`,
          message: __("Requisite type is required", "contacts"),
        });
      }
      if (!requisite.link) {
        errors.push({
          field: `requisite-${index}-link`,
          message: __("Requisite link is required", "contacts"),
        });
      }
    });

    if (!slides?.length) {
      errors.push({
        field: "slides",
        message: __("At least one slide is required", "contacts"),
      });
    }

    slides?.forEach((slide, index) => {
      if (!slide.text) {
        errors.push({
          field: `slide-${index}-text`,
          message: __("Slide text is required", "contacts"),
        });
      }
    });

    setErrorMessages(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const addRequisite = () => {
    const newRequisite = {
      id: details.requisites.length,
      type: "",
      link: "",
    };
    setAttributes({
      details: {
        ...details,
        requisites: [...details.requisites, newRequisite],
      },
    });
    checkRequiredFields();
  };

  const removeRequisite = (id) => {
    const newRequisites = details.requisites.filter((_, index) => index !== id);
    setAttributes({ details: { ...details, requisites: newRequisites } });
    checkRequiredFields();
  };

  const updateRequisite = (id, key, value) => {
    const newRequisites = details.requisites.map((requisite, index) => {
      if (index === id) {
        return { ...requisite, [key]: value };
      }
      return requisite;
    });
    setAttributes({ details: { ...details, requisites: newRequisites } });
    checkRequiredFields();
  };

  const addSlide = () => {
    const newSlide = {
      id: slides.length,
      text: "",
      highlighted: false,
    };
    setAttributes({ slides: [...slides, newSlide] });
    checkRequiredFields();
  };

  const removeSlide = (id) => {
    const newSlides = slides.filter((_, index) => index !== id);
    setAttributes({ slides: newSlides });
    checkRequiredFields();
  };

  const updateSlide = (id, key, value) => {
    const newSlides = slides.map((slide, index) => {
      if (index === id) {
        return { ...slide, [key]: value };
      }
      return slide;
    });
    setAttributes({ slides: newSlides });
    checkRequiredFields();
  };

  useEffect(() => {
    checkRequiredFields();
  }, [details, slides]);

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
        <div className="custom-block-cardlist">
          {slides.map((slide, index) => (
            <div className="custom-block-card" key={index}>
              <div>
                <RichText
                  tagName="h3"
                  placeholder={__("Slide Text", "contacts")}
                  value={slide.text}
                  onChange={(value) => updateSlide(index, "text", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `slide-${index}-text`
                ) && (
                  <div className="custom-block-error">
                    {__("Slide text is required", "contacts")}
                  </div>
                )}
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={slide.highlighted}
                  onChange={() =>
                    updateSlide(index, "highlighted", !slide.highlighted)
                  }
                />
                {__("Highlighted", "contacts")}
              </label>

              <div className="custom-block-remove-card">
                <Button
                  isDestructive
                  isTertiary
                  icon="trash"
                  onClick={() => removeSlide(index)}
                >
                  {__("Remove", "contacts")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {errorMessages.some((error) => error.field === "slides") && (
          <div className="custom-block-error">
            {__("At least one item is required", "contacts")}
          </div>
        )}

        <div className="custom-block-add-card">
          <Button isPrimary icon="plus" onClick={addSlide}>
            {__("Add Slide", "contacts")}
          </Button>
        </div>
      </div>

      <div className="custom-block">
        <div className="custom-block-image">
          <MediaUploadCheck>
            <MediaUpload
              onSelect={(media) =>
                setAttributes({
                  details: {
                    ...details,
                    image: { url: media.url, alt: media.alt },
                  },
                })
              }
              allowedTypes={["image"]}
              render={({ open }) => (
                <div>
                  {details.image.url ? (
                    <img
                      src={details.image.url}
                      alt={details.image.alt}
                      onClick={open}
                    />
                  ) : (
                    <Button isSecondary onClick={open}>
                      {__("Upload Image", "contacts")}
                    </Button>
                  )}
                </div>
              )}
            />
          </MediaUploadCheck>
          {errorMessages.some((error) => error.field === "details-image") && (
            <div className="custom-block-error">
              {__("Image is required", "contacts")}
            </div>
          )}
        </div>

        <br />

        <div className="custom-block-cardlist">
          {details.requisites.map((requisite, index) => (
            <div class="custom-block-card" key={index}>
              <RichText
                tagName="p"
                placeholder={__("Requisite Type", "contacts")}
                value={requisite.type}
                onChange={(value) => updateRequisite(index, "type", value)}
                allowedFormats={[]}
              />
              {errorMessages.some(
                (error) => error.field === `requisite-${index}-type`
              ) && (
                <div className="custom-block-error">
                  {__("Requisite type is required", "contacts")}
                </div>
              )}

              <div className="custom-block-link">
                <RichText
                  tagName="p"
                  placeholder={__("Requisite Link", "contacts")}
                  value={requisite.link}
                  onChange={(value) => updateRequisite(index, "link", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `requisite-${index}-link`
                ) && (
                  <div className="custom-block-error">
                    {__("Requisite link is required", "contacts")}
                  </div>
                )}
              </div>

              <div className="custom-block-remove-card">
                <Button
                  isDestructive
                  isTertiary
                  icon="trash"
                  onClick={() => removeRequisite(index)}
                >
                  {__("Remove", "contacts")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {errorMessages.some(
          (error) => error.field === "details-requisites"
        ) && (
          <div className="custom-block-error">
            {__("At least one item is required", "contacts")}
          </div>
        )}

        <div className="custom-block-add-card">
          <Button isPrimary icon="plus" onClick={addRequisite}>
            {__("Add Requisite", "contacts")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
