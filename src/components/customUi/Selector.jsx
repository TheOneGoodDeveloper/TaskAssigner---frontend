/* eslint-disable react/prop-types */
import { motion } from "framer-motion";

const Selector = ({
  label,
  name,
  id,
  value,
  onChange,
  options,
  required = false,
}) => {
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const optionVariants = {
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  };

  return (
    <div>
      <motion.label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {label}
      </motion.label>
      <motion.select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="mt-2 p-2 border rounded-md w-full bg-white"
        required={required}
        initial="hidden"
        animate="visible"
        variants={dropdownVariants}
        whileFocus={{ scale: 1.02 }}
      >
        <option value="" disabled>
          Select {name}
        </option>
        {options.map((option) => (
          <motion.option
            key={option.value}
            value={option.value}
            whileHover="hover"
            variants={optionVariants}
          >
            {option.label}
          </motion.option>
        ))}
      </motion.select>
    </div>
  );
};

export default Selector;
