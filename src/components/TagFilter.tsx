import React from 'react';

interface TagFilterProps {
  allTags: string[];
  onTagSelect: (tags: string[]) => void;
  selectedTags: string[];
}

const TagFilter = ({ allTags, onTagSelect, selectedTags }: TagFilterProps) => {
  const handleTagChange = (tag: string) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onTagSelect(updatedTags);
  };

  return (
    <div className="tag-filter">
      {allTags.map((tag) => (
        <label key={tag} className="tag-label">
          <input
            type="checkbox"
            checked={selectedTags.includes(tag)}
            onChange={() => handleTagChange(tag)}
          />
          {tag}
        </label>
      ))}
    </div>
  );
};

export default TagFilter;
