import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useResume } from '../../../context/ResumeContext.js';
import { Plus, X, Sparkles } from 'lucide-react';
import { getCareerSkillCategories } from '../../../utils/careerExamples.js';
export const SkillsForm = () => {
    const { resumeData, addSkill, removeSkill } = useResume();
    const { skills, personal } = resumeData;
    const categoryMetadata = getCareerSkillCategories(personal?.title || '');
    const [inputs, setInputs] = useState({});
    const handleInputChange = (category, value) => {
        setInputs((prev) => ({ ...prev, [category]: value }));
    };
    const handleKeyDown = (category, e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = inputs[category]?.trim();
            if (val) {
                addSkill(category, val.replace(/,$/, ''));
                setInputs((prev) => ({ ...prev, [category]: '' }));
            }
        }
    };
    const handleAddFromInput = (category) => {
        const val = inputs[category]?.trim();
        if (val) {
            addSkill(category, val);
            setInputs((prev) => ({ ...prev, [category]: '' }));
        }
    };
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-bold uppercase tracking-wider text-slate-900 mb-1", children: "Skills & Competencies" }), _jsx("p", { className: "text-xs text-slate-500", children: "Group relevant skills, tools, methods, and knowledge for your target role." })] }), _jsx("div", { className: "space-y-4", children: categoryMetadata.map(({ key, label, placeholder, suggestions }) => {
                    const currentList = skills[key] || [];
                    const inputValue = inputs[key] || '';
                    return (_jsxs("div", { className: "p-3.5 border border-slate-200 rounded-xl bg-white space-y-2.5", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("label", { className: "text-xs font-bold text-slate-800 flex items-center space-x-1.5", children: [_jsx("span", { children: label }), _jsxs("span", { className: "text-[10px] text-slate-400 font-normal", children: ["(", currentList.length, ")"] })] }) }), _jsxs("div", { className: "flex flex-wrap gap-1.5 min-h-6", children: [currentList.map((skill) => (_jsxs("span", { className: "inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 group", children: [_jsx("span", { children: skill }), _jsx("button", { type: "button", onClick: () => removeSkill(key, skill), className: "text-slate-400 hover:text-rose-600 rounded p-0.5", children: _jsx(X, { className: "w-3 h-3" }) })] }, skill))), currentList.length === 0 && (_jsxs("span", { className: "text-[11px] text-slate-400 italic", children: ["No ", label.toLowerCase(), " added yet."] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "text", value: inputValue, onChange: (e) => handleInputChange(key, e.target.value), onKeyDown: (e) => handleKeyDown(key, e), placeholder: placeholder, className: "flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-900 bg-white" }), _jsxs("button", { type: "button", onClick: () => handleAddFromInput(key), disabled: !inputValue.trim(), className: "inline-flex items-center space-x-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-40 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 transition-colors", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Add" })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-1 pt-1", children: [_jsxs("span", { className: "text-[10px] text-slate-400 font-medium mr-1 flex items-center", children: [_jsx(Sparkles, { className: "w-2.5 h-2.5 mr-0.5 text-indigo-500" }), "Suggestions:"] }), suggestions
                                        .filter((s) => !currentList.includes(s))
                                        .slice(0, 5)
                                        .map((sug) => (_jsxs("button", { type: "button", onClick: () => addSkill(key, sug), className: "text-[10px] text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded px-1.5 py-0.5 transition-colors", children: ["+ ", sug] }, sug)))] })] }, key));
                }) })] }));
};
