import { IoIosStarOutline } from "react-icons/io";
import { IoStar } from "react-icons/io5";

const RatingStar = ({ rating }) => {
  // Ensure rating is between 0 and 5
  const clampedRating = Math.max(0, Math.min(rating, 5));
  const fullStars = Math.floor(clampedRating);
  const halfStar = clampedRating % 1 > 0.5;

  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className="text-yellow-500">
          {index < fullStars ? <IoStar /> : <IoIosStarOutline />}
        </span>
      ))}
      {halfStar && (
        <span className="text-yellow-500">
          <IoStar />
        </span>
      )}
    </div>
  );
};

export default RatingStar;
