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
  const { title, projects } = attributes;
  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const checkRequiredFields = () => {
    const errors = [];

    if (!title) {
      errors.push({
        field: "title",
        message: __("Title is required", "projects"),
      });
    }

    if (projects.length === 0) {
      errors.push({
        field: "projects",
        message: __("At least one item is required", "projects"),
      });
    }

    projects.forEach((project, index) => {
      if (!project.image.url) {
        errors.push({
          field: `project-${index}-image`,
          message: __("Project image is required", "projects"),
        });
      }
      if (!project.gif.url) {
        errors.push({
          field: `project-${index}-gif`,
          message: __("Project GIF is required", "projects"),
        });
      }
    });

    setErrorMessages(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const addProject = () => {
    const newProject = {
      id: projects.length,
      image: { url: "", alt: "" },
      gif: { url: "", alt: "" },
      link: "",
      repo: "",
      isLive: false,
    };
    setAttributes({ projects: [...projects, newProject] });
    checkRequiredFields();
  };

  const removeProject = (id) => {
    const newProjects = projects.filter((_, index) => index !== id);
    setAttributes({ projects: newProjects });
    checkRequiredFields();
  };

  const updateProject = (id, key, value) => {
    const newProjects = projects.map((project, index) => {
      if (index === id) {
        return { ...project, [key]: value };
      }
      return project;
    });
    setAttributes({ projects: newProjects });
    checkRequiredFields();
  };

  useEffect(() => {
    checkRequiredFields();
  }, [title, projects]);

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
              {__("Title is required", "projects")}
            </div>
          )}
        </div>

        <div className="custom-block-grid">
          {projects.map((project, index) => (
            <div className="custom-block-card" key={index}>
              <div className="custom-block-image">
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      updateProject(index, "image", {
                        url: media.url,
                        alt: media.alt,
                      })
                    }
                    allowedTypes={["image"]}
                    render={({ open }) => (
                      <div>
                        {project.image.url ? (
                          <img
                            src={project.image.url}
                            alt={project.image.alt}
                            onClick={open}
                          />
                        ) : (
                          <Button isSecondary onClick={open}>
                            {__("Upload Image", "projects")}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {errorMessages.some(
                  (error) => error.field === `project-${index}-image`
                ) && (
                  <div className="custom-block-error">
                    {__("Project image is required", "projects")}
                  </div>
                )}
              </div>

              <div className="custom-block-image">
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      updateProject(index, "gif", {
                        url: media.url,
                        alt: media.alt,
                      })
                    }
                    allowedTypes={["image/gif"]}
                    render={({ open }) => (
                      <div>
                        {project.gif.url ? (
                          <img
                            src={project.gif.url}
                            alt={project.gif.alt}
                            onClick={open}
                          />
                        ) : (
                          <Button isSecondary onClick={open}>
                            {__("Upload GIF", "projects")}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {errorMessages.some(
                  (error) => error.field === `project-${index}-gif`
                ) && (
                  <div className="custom-block-error">
                    {__("Project GIF is required", "projects")}
                  </div>
                )}
              </div>

              <div className="custom-block-link">
                <RichText
                  tagName="p"
                  placeholder={__("Project Link", "projects")}
                  value={project.link}
                  onChange={(value) => updateProject(index, "link", value)}
                  allowedFormats={[]}
                />
              </div>

              <div className="custom-block-link">
                <RichText
                  tagName="p"
                  placeholder={__("Project Repo", "projects")}
                  value={project.repo}
                  onChange={(value) => updateProject(index, "repo", value)}
                  allowedFormats={[]}
                />
              </div>

              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={project.isLive}
                    onChange={() =>
                      updateProject(index, "isLive", !project.isLive)
                    }
                  />
                  {__("is Live", "projects")}
                </label>
              </div>

              <div className="custom-block-remove-card">
                <Button
                  isDestructive
                  isTertiary
                  icon="trash"
                  onClick={() => removeProject(index)}
                >
                  {__("Remove", "projects")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {errorMessages.some((error) => error.field === "projects") && (
          <div className="custom-block-error">
            {__("At least one item is required", "projects")}
          </div>
        )}

        <div className="custom-block-add-card">
          <Button isPrimary icon="plus" onClick={addProject}>
            {__("Add Project", "projects")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
