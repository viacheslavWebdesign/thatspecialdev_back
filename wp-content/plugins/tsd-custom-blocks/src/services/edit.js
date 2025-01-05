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
  const { title, services } = attributes;
  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const checkRequiredFields = () => {
    const errors = [];

    if (!title) {
      errors.push({
        field: "title",
        message: __("Title is required", "services"),
      });
    }

    if (services.length === 0) {
      errors.push({
        field: "services",
        message: __("At least one item is required", "services"),
      });
    }

    services.forEach((service, index) => {
      if (!service.title) {
        errors.push({
          field: `service-${index}-title`,
          message: __("Service title is required", "services"),
        });
      }
      if (!service.image.url) {
        errors.push({
          field: `service-${index}-image`,
          message: __("Service image is required", "services"),
        });
      }
      if (!service.text) {
        errors.push({
          field: `service-${index}-text`,
          message: __("Service text is required", "services"),
        });
      }
    });

    setErrorMessages(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const addService = () => {
    const newService = {
      id: services.length,
      title: "",
      subtitle: "",
      text: "",
      image: { url: "", alt: "" },
    };
    setAttributes({ services: [...services, newService] });
    checkRequiredFields();
  };

  const removeService = (id) => {
    const newServices = services.filter((_, index) => index !== id);
    setAttributes({ services: newServices });
    checkRequiredFields();
  };

  const updateService = (id, key, value) => {
    const newServices = services.map((service, index) => {
      if (index === id) {
        return { ...service, [key]: value };
      }
      return service;
    });
    setAttributes({ services: newServices });
    checkRequiredFields();
  };

  useEffect(() => {
    checkRequiredFields();
  }, [title, services]);

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
              {__("Title is required", "services")}
            </div>
          )}
        </div>

        <div className="custom-block-grid">
          {services.map((service, index) => (
            <div className="custom-block-card" key={index}>
              <div class="custom-block-image">
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      updateService(index, "image", {
                        url: media.url,
                        alt: media.alt,
                      })
                    }
                    allowedTypes={["image"]}
                    render={({ open }) => (
                      <div>
                        {service.image.url ? (
                          <img
                            src={service.image.url}
                            alt={service.image.alt}
                            onClick={open}
                          />
                        ) : (
                          <Button isSecondary onClick={open}>
                            {__("Upload Image", "services")}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {errorMessages.some(
                  (error) => error.field === `service-${index}-image`
                ) && (
                  <div className="custom-block-error">
                    {__("Service image is required", "services")}
                  </div>
                )}
              </div>

              <div>
                <RichText
                  tagName="h3"
                  placeholder={__("Service Title", "services")}
                  value={service.title}
                  onChange={(value) => updateService(index, "title", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `service-${index}-title`
                ) && (
                  <div className="custom-block-error">
                    {__("Service title is required", "services")}
                  </div>
                )}
              </div>

              <div>
                <RichText
                  tagName="h4"
                  placeholder={__("Service Subtitle", "services")}
                  value={service.subtitle}
                  onChange={(value) => updateService(index, "subtitle", value)}
                  allowedFormats={[]}
                />
              </div>

              <div>
                <RichText
                  tagName="p"
                  placeholder={__("Service Text", "services")}
                  value={service.text}
                  onChange={(value) => updateService(index, "text", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `service-${index}-text`
                ) && (
                  <div className="custom-block-error">
                    {__("Service text is required", "services")}
                  </div>
                )}
              </div>

              <div className="custom-block-remove-card">
                <Button
                  isDestructive
                  isTertiary
                  icon="trash"
                  onClick={() => removeService(index)}
                  allowedFormats={[]}
                >
                  {__("Remove", "services")}
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errorMessages.some((error) => error.field === "services") && (
          <div className="custom-block-error">
            {__("At least one item is required", "services")}
          </div>
        )}
        <div className="custom-block-add-card">
          <Button isPrimary icon="plus" onClick={addService}>
            {__("Add Service", "services")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
