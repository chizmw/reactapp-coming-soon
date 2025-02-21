import PropTypes from 'prop-types';

const TagFilter = ({ allTags, onTagSelect, selectedTags = [] }) => {
  const handleTagChange = (tag) => {
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

TagFilter.propTypes = {
  allTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTagSelect: PropTypes.func.isRequired,
  selectedTags: PropTypes.arrayOf(PropTypes.string),
};

export default TagFilter;
