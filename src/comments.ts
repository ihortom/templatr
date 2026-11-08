// Returns the comment attached to a template, or '' if it has none.
// Comments are keyed by (a fragment of) the template text they annotate.
export const getComment = (template: string, comments: object): string => {
    const entries = Object.entries(comments) as [string, string][];
    const exact = entries.find(([key]) => key === template);
    if (exact) return exact[1];

    const partial = entries
        .filter(([key]) => key !== '' && template.includes(key))
        .sort(([a], [b]) => b.length - a.length)[0];
    return partial ? partial[1] : '';
};

// Case-insensitive match of a search pattern anywhere in a template's text or its comment.
export const matchesPattern = (template: string, comments: object, pattern: string): boolean => {
    const p = pattern.toLowerCase();
    return template.toLowerCase().includes(p) || getComment(template, comments).toLowerCase().includes(p);
};
