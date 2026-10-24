import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ResumeRenderer } from '../../templates/ResumeRenderer.js';

const elementHeight = (element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
};

function splitSection(section, maxHeight) {
    if (elementHeight(section) <= maxHeight) return [{ element: section.cloneNode(true), height: elementHeight(section) }];

    const candidates = [];
    const visit = (parent, path = []) => {
        Array.from(parent.children).forEach((child, index) => {
            const childPath = [...path, index];
            if (child.children.length > 1) candidates.push({ element: child, path: childPath, depth: childPath.length });
            visit(child, childPath);
        });
    };
    visit(section);
    candidates.sort((a, b) => a.depth - b.depth);

    const group = candidates.find(({ element }) => element.children.length > 1);
    if (!group) return [{ element: section.cloneNode(true), height: elementHeight(section) }];

    const overhead = Math.max(0, elementHeight(section) - elementHeight(group.element));
    const itemLimit = Math.max(120, maxHeight - overhead);
    const fragments = [];
    let items = [];
    let used = 0;
    const flush = () => {
        if (!items.length) return;
        const fragment = section.cloneNode(true);
        let target = fragment;
        for (const index of group.path) target = target.children[index];
        target.replaceChildren(...items.map((item) => item.cloneNode(true)));
        fragments.push({ element: fragment, height: overhead + used });
        items = [];
        used = 0;
    };

    Array.from(group.element.children).forEach((item) => {
        const height = elementHeight(item);
        if (items.length && used + height > itemLimit) flush();
        items.push(item);
        used += height;
    });
    flush();
    return fragments.length > 1 ? fragments : [{ element: section.cloneNode(true), height: elementHeight(section) }];
}

function makePageMarkup(root, mainSections, extraSections, pageSections, isFirstPage) {
    const rootClone = root.cloneNode(true);
    const templateClone = rootClone.firstElementChild;
    const headerClone = templateClone?.querySelector('header');
    if (!isFirstPage) {
        headerClone?.remove();
        templateClone?.querySelector('aside')?.remove();
    }

    const mainClone = templateClone?.querySelector('main');
    if (mainClone) {
        mainClone.replaceChildren(...pageSections
            .filter((section) => mainSections.includes(section.source))
            .map((section) => section.element.cloneNode(true)));
    }

    Array.from(rootClone.children).slice(1).forEach((child) => child.remove());
    pageSections.filter((section) => extraSections.includes(section.source)).forEach((section) => {
        rootClone.appendChild(section.element.cloneNode(true));
    });
    return rootClone.outerHTML;
}

export const PaginatedResumePreview = ({ data, templateId }) => {
    const measureRef = useRef(null);
    const [pages, setPages] = useState([]);

    useLayoutEffect(() => {
        const sheet = measureRef.current;
        const root = sheet?.firstElementChild;
        if (!sheet || !root) return;

        const templateRoot = root.firstElementChild;
        const header = templateRoot?.querySelector('header');
        const main = templateRoot?.querySelector('main');
        if (!templateRoot || !main) {
            setPages([root.innerHTML]);
            return;
        }

        const mainSections = Array.from(main.children);
        const extraSections = Array.from(root.children).slice(1);
        const computedSheet = window.getComputedStyle(sheet);
        const availableHeight = sheet.clientHeight
            - (parseFloat(computedSheet.paddingTop) || 0)
            - (parseFloat(computedSheet.paddingBottom) || 0)
            - (parseFloat(computedSheet.borderTopWidth) || 0)
            - (parseFloat(computedSheet.borderBottomWidth) || 0)
            - 48;
        const headerHeight = header ? elementHeight(header) : 0;
        const sections = [...mainSections, ...extraSections].flatMap((source) =>
            splitSection(source, availableHeight).map((part) => ({ ...part, source }))
        );

        const pageGroups = [{ sections: [], used: headerHeight }];
        sections.forEach((section) => {
            let page = pageGroups[pageGroups.length - 1];
            if (page.used > 0 && page.used + section.height > availableHeight) {
                page = { sections: [], used: 0 };
                pageGroups.push(page);
            }
            page.sections.push(section);
            page.used += section.height;
        });

        setPages(pageGroups.map((page, index) =>
            makePageMarkup(root, mainSections, extraSections, page.sections, index === 0)
        ));
    }, [data, templateId]);

    return _jsxs(React.Fragment, { children: [
        _jsx('div', { ref: measureRef, className: 'a4-page a4-page-measure', style: { position: 'fixed', left: '-10000px', top: 0, visibility: 'hidden', overflow: 'visible' }, children:
            _jsx(ResumeRenderer, { data, templateId })
        }),
        _jsx('div', { id: 'resume-preview-sheet', className: 'flex flex-col items-center gap-6', children:
            pages.map((markup, index) => (_jsx('div', { className: 'a4-page bg-white relative text-slate-900 shadow-lg rounded-xs', dangerouslySetInnerHTML: { __html: markup } }, index)))
        })
    ] });
};
