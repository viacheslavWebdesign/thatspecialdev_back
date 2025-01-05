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
  const { title, jobs } = attributes; // Убираем 'projects' из атрибутов, так как это вложенная часть jobs
  const [errorMessages, setErrorMessages] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const checkRequiredFields = () => {
    const errors = [];

    if (!title) {
      errors.push({
        field: "title",
        message: __("Title is required", "experience"),
      });
    }

    if (jobs.length === 0) {
      errors.push({
        field: "jobs",
        message: __("At least one item is required", "experience"),
      });
    }

    jobs.forEach((job, jobIndex) => {
      if (!job.title) {
        errors.push({
          field: `job-${jobIndex}-title`,
          message: __("Job title is required", "experience"),
        });
      }
      if (!job.date) {
        errors.push({
          field: `job-${jobIndex}-date`,
          message: __("Job date is required", "experience"),
        });
      }
      if (!job.image || !job.image.url) {
        // Добавляем проверку на отсутствие URL
        errors.push({
          field: `job-${jobIndex}-image`,
          message: __("Job image is required", "experience"),
        });
      }
      if (!job.text) {
        errors.push({
          field: `job-${jobIndex}-text`,
          message: __("Job text is required", "experience"),
        });
      }

      if (job.projects.length === 0) {
        errors.push({
          field: `job-${jobIndex}-projects`,
          message: __("At least one project is required", "experience"),
        });
      }

      job.projects.forEach((project, projectIndex) => {
        if (!project.image || !project.image.url) {
          // Добавляем проверку на отсутствие URL
          errors.push({
            field: `project-${jobIndex}-${projectIndex}-image`,
            message: __("Project image is required", "experience"),
          });
        }
        if (!project.link) {
          errors.push({
            field: `project-${jobIndex}-${projectIndex}-link`,
            message: __("Project link is required", "experience"),
          });
        }
      });
    });

    setErrorMessages(errors);
    setIsValid(errors.length === 0);
    return errors.length === 0;
  };

  const addJob = () => {
    const newJob = {
      id: jobs.length,
      title: "",
      date: "",
      text: "",
      image: { url: "", alt: "" },
      projects: [],
    };
    setAttributes({ jobs: [...jobs, newJob] });
    checkRequiredFields();
  };

  const removeJob = (id) => {
    const newJobs = jobs.filter((_, index) => index !== id);
    setAttributes({ jobs: newJobs });
    checkRequiredFields();
  };

  const updateJob = (id, key, value) => {
    const newJob = jobs.map((job, index) => {
      if (index === id) {
        return { ...job, [key]: value };
      }
      return job;
    });
    setAttributes({ jobs: newJob });
    checkRequiredFields();
  };

  const addProject = (jobIndex) => {
    const newProject = { image: { url: "", alt: "" }, link: "" };
    const updatedJobs = jobs.map((job, index) => {
      if (index === jobIndex) {
        return { ...job, projects: [...job.projects, newProject] };
      }
      return job;
    });
    setAttributes({ jobs: updatedJobs });
    checkRequiredFields();
  };

  const removeProject = (jobIndex, projectIndex) => {
    const updatedJobs = jobs.map((job, index) => {
      if (index === jobIndex) {
        return {
          ...job,
          projects: job.projects.filter((_, pIndex) => pIndex !== projectIndex),
        };
      }
      return job;
    });
    setAttributes({ jobs: updatedJobs });
    checkRequiredFields();
  };

  const updateProject = (jobIndex, projectIndex, key, value) => {
    const updatedJobs = jobs.map((job, index) => {
      if (index === jobIndex) {
        const updatedProjects = job.projects.map((project, pIndex) => {
          if (pIndex === projectIndex) {
            return { ...project, [key]: value };
          }
          return project;
        });
        return { ...job, projects: updatedProjects };
      }
      return job;
    });
    setAttributes({ jobs: updatedJobs });
    checkRequiredFields();
  };

  useEffect(() => {
    checkRequiredFields();
  }, [title, jobs]); // Убираем 'projects', так как оно вложено в 'jobs'

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
              {__("Title is required", "experience")}
            </div>
          )}
        </div>

        <div className="custom-block-cardlist">
          {jobs.map((job, jobIndex) => (
            <div className="custom-block-card" key={jobIndex}>
              <div className="custom-block-image">
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      updateJob(jobIndex, "image", {
                        url: media.url,
                        alt: media.alt,
                      })
                    }
                    allowedTypes={["image"]}
                    render={({ open }) => (
                      <div>
                        {job.image.url ? (
                          <img
                            src={job.image.url}
                            alt={job.image.alt}
                            onClick={open}
                          />
                        ) : (
                          <Button isSecondary onClick={open}>
                            {__("Upload Image", "experience")}
                          </Button>
                        )}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {errorMessages.some(
                  (error) => error.field === `job-${jobIndex}-image`
                ) && (
                  <div className="custom-block-error">
                    {__("Job image is required", "experience")}
                  </div>
                )}
              </div>

              <div>
                <RichText
                  tagName="h3"
                  placeholder={__("Job Title", "experience")}
                  value={job.title}
                  onChange={(value) => updateJob(jobIndex, "title", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `job-${jobIndex}-title`
                ) && (
                  <div className="custom-block-error">
                    {__("Job title is required", "experience")}
                  </div>
                )}
              </div>

              <div>
                <RichText
                  tagName="h4"
                  placeholder={__("Job Date", "experience")}
                  value={job.date}
                  onChange={(value) => updateJob(jobIndex, "date", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `job-${jobIndex}-date`
                ) && (
                  <div className="custom-block-error">
                    {__("Job date is required", "experience")}
                  </div>
                )}
              </div>

              <div>
                <RichText
                  tagName="p"
                  placeholder={__("Job Text", "experience")}
                  value={job.text}
                  onChange={(value) => updateJob(jobIndex, "text", value)}
                  allowedFormats={[]}
                />
                {errorMessages.some(
                  (error) => error.field === `job-${jobIndex}-text`
                ) && (
                  <div className="custom-block-error">
                    {__("Job text is required", "experience")}
                  </div>
                )}
              </div>
              <div className="custom-block-gallery">
                {job.projects.map((project, projectIndex) => (
                  <div className="custom-block-gallery-item" key={projectIndex}>
                    <div className="custom-block-gallery-image">
                      <MediaUploadCheck>
                        <MediaUpload
                          onSelect={(media) =>
                            updateProject(jobIndex, projectIndex, "image", {
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
                                  {__("Upload Image", "experience")}
                                </Button>
                              )}
                            </div>
                          )}
                        />
                      </MediaUploadCheck>
                      {errorMessages.some(
                        (error) =>
                          error.field ===
                          `project-${jobIndex}-${projectIndex}-image`
                      ) && (
                        <div className="custom-block-error">
                          {__("Project image is required", "experience")}
                        </div>
                      )}
                    </div>

                    <div className="custom-block-gallery-item-body">
                      <div className="custom-block-link">
                        <RichText
                          tagName="p"
                          placeholder={__("Project Link", "experience")}
                          value={project.link}
                          onChange={(value) =>
                            updateProject(jobIndex, projectIndex, "link", value)
                          }
                          allowedFormats={[]}
                        />
                      </div>
                      {errorMessages.some(
                        (error) =>
                          error.field ===
                          `project-${jobIndex}-${projectIndex}-link`
                      ) && (
                        <div className="custom-block-error">
                          {__("Project link is required", "experience")}
                        </div>
                      )}
                    </div>

                    <div className="custom-block-remove-card">
                      <Button
                        isDestructive
                        isTertiary
                        icon="trash"
                        onClick={() => removeProject(jobIndex, projectIndex)}
                      >
                        {__("Remove", "experience")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {errorMessages.some(
                (error) => error.field === `job-${jobIndex}-projects`
              ) && (
                <div className="custom-block-error">
                  {__("At least one item is required", "experience")}
                </div>
              )}

              <div className="custom-block-add-card">
                <Button
                  isPrimary
                  icon="plus"
                  onClick={() => addProject(jobIndex)}
                >
                  {__("Add Project", "experience")}
                </Button>
              </div>

              <div className="custom-block-remove-card">
                <Button
                  isDestructive
                  isTertiary
                  icon="trash"
                  onClick={() => removeJob(jobIndex)}
                >
                  {__("Remove", "experience")}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {errorMessages.some((error) => error.field === "jobs") && (
          <div className="custom-block-error">
            {__("At least one item is required", "experience")}
          </div>
        )}

        <div className="custom-block-add-card">
          <Button isPrimary icon="plus" onClick={addJob}>
            {__("Add Job", "experience")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Edit;
