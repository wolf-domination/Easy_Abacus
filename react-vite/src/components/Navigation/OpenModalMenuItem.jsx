// OpenModalMenuItem.jsx
import PropTypes from "prop-types";
import { useModal } from "../../context/Modal";

export default function OpenModalMenuItem({ itemText, onItemClick, modalComponent }) {
  const { setModalContent } = useModal();   // removed setOnModalClose

  const handleClick = () => {
    if (typeof onItemClick === "function") onItemClick();
    setModalContent(modalComponent);
  };

  return (
    <button type="button" onClick={handleClick}>
      {itemText}
    </button>
  );
}

OpenModalMenuItem.propTypes = {
  itemText: PropTypes.string.isRequired,
  onItemClick: PropTypes.func,
  modalComponent: PropTypes.node.isRequired,
};
