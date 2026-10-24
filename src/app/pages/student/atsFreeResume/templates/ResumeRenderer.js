import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { TemplateClassic } from './TemplateClassic.js';
import { TemplateProfessional } from './TemplateProfessional.js';
import { TemplateModern } from './TemplateModern.js';
import { TemplateMinimal } from './TemplateMinimal.js';
import { TemplateStudent } from './TemplateStudent.js';
import { TemplateWithPhoto } from './TemplateWithPhoto.js';
import { TemplateCreative } from './TemplateCreative.js';
import { TemplateCompact } from './TemplateCompact.js';
import { TemplateExecutive } from './TemplateExecutive.js';
import { TemplateTech } from './TemplateTech.js';

export const ResumeRenderer = ({ resume, data, templateId }) => {
    const activeResume = resume || data;
    let renderedTemplate;
    switch (templateId) {
        case 'classic':
            renderedTemplate = _jsx(TemplateClassic, { resume: activeResume });
            break;
        case 'professional':
            renderedTemplate = _jsx(TemplateProfessional, { resume: activeResume });
            break;
        case 'modern':
            renderedTemplate = _jsx(TemplateModern, { resume: activeResume });
            break;
        case 'minimal':
            renderedTemplate = _jsx(TemplateMinimal, { resume: activeResume });
            break;
        case 'student':
            renderedTemplate = _jsx(TemplateStudent, { resume: activeResume });
            break;
        case 'photo':
            renderedTemplate = _jsx(TemplateWithPhoto, { resume: activeResume });
            break;
        case 'creative':
            renderedTemplate = _jsx(TemplateCreative, { resume: activeResume });
            break;
        case 'compact':
            renderedTemplate = _jsx(TemplateCompact, { resume: activeResume });
            break;
        case 'executive':
            renderedTemplate = _jsx(TemplateExecutive, { resume: activeResume });
            break;
        case 'tech':
            renderedTemplate = _jsx(TemplateTech, { resume: activeResume });
            break;
        default:
            renderedTemplate = _jsx(TemplateClassic, { resume: activeResume });
    }

    return _jsxs("div", {
        className: "w-full",
        children: [
            renderedTemplate,
            _jsxs("section", {
                className: "mt-3.5 text-[10.5px] text-slate-800",
                children: [
                    _jsx("h2", {
                        className: "text-[11px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5 font-sans",
                        children: "Declaration",
                    }),
                    _jsx("p", {
                        className: "leading-relaxed",
                        children: "I hereby declare that the information provided above is true and correct to the best of my knowledge and belief.",
                    }),
                ],
            }),
        ],
    });
};
