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
  const { title, technologies } = attributes;
  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const checkRequiredFields = () => {
    const errors = [];

    if (!title) {
      errors.push({
        field: "title",
        message: __("Title is required", "technologies"),
      });
    }

    if (technologies.length === 0) {
      errors.push({
        field: "technologies",
        message: __("At least one item is required", "technologies"),
      });
    }

    technologies.forEach((technology, index) => {
      if (!technology.image.url) {
        errors.push({
          field: `technology-${index}-image`,
          message: __("Technology image is required", "technologies"),
        });
      }
    });

    setErrorMessages(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const addTechnology = () => {
    const newTechnology = {
      id: technologies.length,
      image: { url: "", alt: "" },
    };
    setAttributes({ technologies: [...technologies, newTechnology] });
    checkRequiredFields();
  };

  const removeTechnology = (id) => {
    const newTechnologies = technologies.filter((_, index) => index !== id);
    setAttributes({ technologies: newTechnologies });
    checkRequiredFields();
  };

  const updateTechnology = (id, key, value) => {
    const newTechnologies = technologies.map((technology, index) => {
      if (index === id) {
        return { ...technology, [key]: value };
      }
      return technology;
    });
    setAttributes({ technologies: newTechnologies });
    checkRequiredFields();
  };

  useEffect(() => {
    checkRequiredFields();
  }, [title, technologies]);

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
            value={title}
            onChange={(value) => setAttributes({ title: value })}
            placeholder="Enter title"
            allowedFormats={["core/italic"]}
          />
          {errorMessages.some((error) => error.field === "title") && (
            <div className="custom-block-error">
              {__("Title is required", "technologies")}
            </div>
          )}
        </div>

        <div className="custom-block-gallery">
          {technologies.map((technology, index) => (
            <div className="custom-block-gallery-item" key={index}>
              <div className="custom-block-gallery-image">
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      updateTechnology(index, "image", {
                        url: media.url,
                        alt: media.alt,
                      })
                    }
                    allowedTypes={["image"]}
                    render={({ open }) => (
                      <div>
                        {technology.image.url ? (
                          <img
                            src={technology.image.url}
                            alt={technology.image.alt}
                            onClick={open}
                          />
                        ) : (
                          <Button isSecondary onClick={open}>
                            {__("Upload Image", "technologies")}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {errorMessages.some(
                  (error) => error.field === `technology-${index}-image`
                ) && (
                  <div className="custom-block-error">
                    {__("Technology image is required", "technologies")}
                  </div>
                )}
              </div>
              <div className="custom-block-gallery-item-body"></div>
              <div className="custom-block-remove-card">
                <Button
                  isDestructive
                  isTertiary
                  icon="trash"
                  onClick={() => removeTechnology(index)}
                  allowedFormats={[]}
                >
                  {__("Remove", "technologies")}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errorMessages.some((error) => error.field === "technologies") && (
          <div className="custom-block-error">
            {__("At least one item is required", "technologies")}
          </div>
        )}
        <div className="custom-block-add-card">
          <Button isPrimary icon="plus" onClick={addTechnology}>
            {__("Add Technology", "technologies")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
