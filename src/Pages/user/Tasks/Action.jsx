/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BsThreeDotsVertical } from "react-icons/bs";
import EditTask from "./EditTask";
import DeleteTask from "./DeleteTask";

const Action = ({ task, onEdit, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // console.log("Action Component Received Task:", task);
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button>
            <BsThreeDotsVertical />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-32">
          <div className="flex flex-col items-start gap-2">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="text-blue-500 hover:text-blue-700"
            >
              Edit
            </button>
            <DeleteTask taskId={task?._id} onDelete={onDelete} />
          </div>
        </PopoverContent>
      </Popover>

      <EditTask
        taskId={task?._id} // task.id should be passed here
        taskData={task}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onEdit={(updatedTask) => {
          console.log("Updated Task from EditTask:", updatedTask);
          onEdit(updatedTask);
          setIsEditDialogOpen(false);
        }}
      />
    </>
  );
};

export default Action;
