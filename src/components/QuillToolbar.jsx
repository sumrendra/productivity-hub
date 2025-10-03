import React from 'react';

const QuillToolbar = () => (
    <div id="toolbar">
        <span className="ql-formats">
            <select className="ql-header" defaultValue="">
                <option value="1">Heading 1</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
                <option value="">Normal</option>
            </select>
        </span>
        <span className="ql-formats">
            <button className="ql-bold"></button>
            <button className="ql-italic"></button>
            <button className="ql-underline"></button>
            <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
            <button className="ql-list" value="ordered"></button>
            <button className="ql-list" value="bullet"></button>
            <button className="ql-indent" value="-1"></button>
            <button className="ql-indent" value="+1"></button>
        </span>
        <span className="ql-formats">
            <button className="ql-blockquote"></button>
            <button className="ql-code-block"></button>
        </span>
        <span className="ql-formats">
            <button className="ql-link"></button>
            <button className="ql-image"></button>
            <button className="ql-video"></button>
        </span>
        <span className="ql-formats">
            <button className="ql-clean"></button>
        </span>
    </div>
);

export default QuillToolbar;
