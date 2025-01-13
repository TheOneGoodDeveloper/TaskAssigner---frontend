import Table from "@/components/customUi/Table";
import DeleteDialog from "@/components/DeleteDialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CirclesWithBar } from "react-loader-spinner";
import CreateTask from "./CreateTask";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  deleteTask,
  editTask,
  fetchAllTaskPagination,
} from "@/API/admin/task/task_api";
import { TaskDetailsModal } from "@/components/customUi/admin/TaskDetailModal";
import { toast } from "react-toastify";

const getpriority = (priority) => {
  switch (priority) {
    case "Critical":
      return "text-red-600 bg-red-50 rounded-md";
    case "High":
      return "text-orange-600 bg-orange-50 rounded-md";
    case "Regular":
      return "text-blue-600 bg-blue-50 rounded-md";
    case "Low":
      return "text-green-600 bg-green-50 rounded-md";
    default:
      return "text-gray-600 bg-gray-50 rounded-md";
  }
};

const getstatus = (status) => {
  switch (status) {
    case "Pending":
      return "text-red-600 rounded-md bg-red-50";
    case "In progress":
      return "text-yellow-600 rounded-md bg-yellow-50";
    case "Not started":
      return "text-blue-600 rounded-md bg-blue-50";
    case "Completed":
      return "text-green-600 rounded-md bg-green-50";
    default:
      return "text-gray-600 rounded-md bg-gray-50";
  }
};
const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(false);

  const [currentPage, setCurrentPage] = useState(1); // Track current page

  const [itemsPerPage] = useState(10);
  const handleTaskClick = (task) => {
    setSelectedProject(task);
    setIsModalOpen(true);
  };

  const queryClient = useQueryClient();

  const { isLoading, data, error, isError } = useQuery({
    queryKey: ["tasks", currentPage],
    queryFn: () => fetchAllTaskPagination(currentPage, itemsPerPage), // Use a function reference
    staleTime: 1000 * 60, // 1 minute
  });
  const sortedTasks = (data?.tasks || []).sort(
    (a, b) => new Date(b.start_date) - new Date(a.start_date)
  );
  console.log(sortedTasks);

  const updateMutation = useMutation({
    mutationFn: editTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      setIsModalOpen(false);
      toast.success("Project updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update project");
      console.error("Error updating project:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task deleted successfully!");
    },
    onError: (err) => {
      console.log("Error deleting task", err);
    },
  });

  const handleUpdateTask = (taskId) => {
    updateMutation.mutate(taskId);
  };

  const handleDeleteTask = (taskId) => {
    deleteMutation.mutate(taskId);
  };

  if (isError) {
    console.error(error);
  }

  const columns = [
    { key: "task_title", title: "Task Title" },
    { key: "assigned_by", title: "Assigned By", className: "text-center" },
    { key: "assigned_to", title: "Assigned To", className: "text-center" },
    { key: "project_name", title: "Project", className: "text-center" },
    { key: "start_date", title: "Start Date", className: "text-center" },
    { key: "end_date", title: "End Date", className: "text-center" },
    { key: "status", title: "Status", className: "text-center" },
    { key: "priority", title: "Priority", className: "text-center" },
    { key: "action", title: "Action", className: "text-center" },
  ];

  const renderRow = (task) => (
    <>
      <td
        className="px-2 py-3 text-sm"
        onClick={() => {
          handleTaskClick(task, task.project?._id);
        }}
      >
        <div className="inline-flex flex-col">
          <span className="text-primary font-bold">
            {task.task_title || "N/A"}
          </span>
          <span>{task.task_description || "N/A"}</span>
        </div>
      </td>
      <td className="px-2 py-3 text-sm text-center">
        {task.assigned_by?.name || "N/A"} {/* Access nested field */}
      </td>
      <td className="px-2 py-3 text-sm text-center">
        {task.assigned_to?.name || "N/A"} {/* Access nested field */}
      </td>
      <td className="px-2 py-3 text-sm text-center">
        {task.project?.project_name || "N/A"} {/* Access nested field */}
      </td>

      <td className="px-2 py-3 text-sm text-center">
        {new Date(task.start_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) || "N/A"}
      </td>
      <td className="px-2 py-3 text-sm text-center">
        {new Date(task.end_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) || "N/A"}
      </td>
      <td className="px-2 py-2 text-center text-xs font-semibold">
        <span className={getstatus(task.status)}>{task.status || "N/A"}</span>
      </td>
      <td className="px-2 py-2 text-center text-xs font-semibold">
        <span className={getpriority(task.priority)}>
          {task.priority || "N/A"}
        </span>
      </td>
      <td className="px-2 py-3 text-sm text-center">
        {/* Add Delete or Edit Actions */}
        <DeleteDialog
          message="Are you sure you want to delete this task?"
          onConfirm={() => handleDeleteTask(task._id)}
          isLoading={deleteMutation.isPending}
        />
      </td>
    </>
  );

  const totalPages = Math.ceil((data?.total || 0) / itemsPerPage);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 4;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem
            key={i}
            onClick={() => setCurrentPage(i)}
            className={
              currentPage === i ? "rounded-lg bg-taskBlack text-white" : ""
            }
          >
            <PaginationLink>{i}</PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      if (currentPage > 1) {
        items.push(
          <PaginationItem
            key={1}
            onClick={() => setCurrentPage(1)}
            className={
              currentPage === 1 ? "rounded-lg bg-taskBlack text-white" : ""
            }
          >
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis-prev">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem
            key={i}
            onClick={() => setCurrentPage(i)}
            className={
              currentPage === i ? "rounded-lg bg-taskBlack text-white" : ""
            }
          >
            <PaginationLink>{i}</PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-next">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      if (currentPage < totalPages) {
        items.push(
          <PaginationItem
            key={totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className={
              currentPage === totalPages
                ? "rounded-lg bg-taskBlack text-white"
                : ""
            }
          >
            <PaginationLink>{totalPages}</PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="relative mt-0 flex flex-col gap-4">
      <CreateTask />
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-full">
          <CirclesWithBar
            color="#4fa94d"
            outerCircleColor="#4fa94d"
            innerCircleColor="#4fa94d"
            barColor="#4fa94d"
            visible={true}
          />
        </div>
      ) : (
        <div className="flex flex-col justify-start gap-2 relative">
          <Table
            columns={columns}
            data={sortedTasks || []}
            renderRow={renderRow}
          />
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1 || totalPages === 0} // Disable if no previous page or no pages
                  className={
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  } // Add styles to indicate disabled state
                />
                {renderPaginationItems()}
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0} // Disable if no next page or no pages
                  className={
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } // Add styles to indicate disabled state
                />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
      {isModalOpen && (
        <TaskDetailsModal
          task={selectedProject}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleUpdateTask}
        />
      )}
    </div>
  );
};
export default Tasks;
