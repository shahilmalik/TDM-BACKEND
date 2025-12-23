import React from "react";
import { Kanban, Plus } from "lucide-react";
import ContentItem from "../../../components/ContentItem";
import CreateTaskModal from "../components/CreateTaskModal";
import type { PipelinePost } from "../../../types";

export type PipelineColumn = {
  id: string;
  label: string;
  color: string;
};

export type PipelineTabProps = {
  clients: Array<{ id: string; businessName: string }>;
  selectedPipelineClient: string;
  setSelectedPipelineClient: (value: string) => void;

  PIPELINE_COLUMNS: PipelineColumn[];
  pipelineData: Record<string, PipelinePost[]>;

  isManagerOrAbove: boolean;
  handlePipelineDragOver: (e: React.DragEvent) => void;
  handlePipelineDrop: (e: React.DragEvent, columnId: string) => void;
  handlePipelineDragStart: (e: React.DragEvent, post: PipelinePost) => void;

  openCreateTaskModal: () => void;

  fetchPipeline: () => void;
  handleScheduleById: (postId: string, scheduledDate: string) => void;

  openContentItemId: string | number | null;
  setOpenContentItemId: (value: string | number | null) => void;

  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (value: boolean) => void;

  // Create task modal state/handlers
  createTaskTitle: string;
  setCreateTaskTitle: (value: string) => void;
  createTaskServiceId: string;
  setCreateTaskServiceId: (value: string) => void;
  createTaskInvoiceId: string;
  setCreateTaskInvoiceId: (value: string) => void;
  createTaskServices: Array<{ id: string; label: string }>;
  createTaskInvoices: Array<{ id: string; label: string }>;
  createTaskLoading: boolean;
  createTaskError: string | null;
  submitCreateTask: () => void;
};

const PipelineTab: React.FC<PipelineTabProps> = ({
  clients,
  selectedPipelineClient,
  setSelectedPipelineClient,
  PIPELINE_COLUMNS,
  pipelineData,
  isManagerOrAbove,
  handlePipelineDragOver,
  handlePipelineDrop,
  handlePipelineDragStart,
  openCreateTaskModal,
  fetchPipeline,
  handleScheduleById,
  openContentItemId,
  setOpenContentItemId,
  isCreateTaskModalOpen,
  setIsCreateTaskModalOpen,
  createTaskTitle,
  setCreateTaskTitle,
  createTaskServiceId,
  setCreateTaskServiceId,
  createTaskInvoiceId,
  setCreateTaskInvoiceId,
  createTaskServices,
  createTaskInvoices,
  createTaskLoading,
  createTaskError,
  submitCreateTask,
}) => {
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Content Pipeline</h2>
          <p className="text-slate-500 text-sm">Manage client social media workflows</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="p-2 border border-gray-300 bg-white rounded-lg outline-none min-w-[250px] focus:border-[#6C5CE7]"
            value={selectedPipelineClient}
            onChange={(e) => setSelectedPipelineClient(e.target.value)}
          >
            <option value="">-- Select Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPipelineClient ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex h-full gap-4 min-w-[1600px]">
            {PIPELINE_COLUMNS.map((column) => {
              const posts =
                pipelineData[selectedPipelineClient]?.filter((p) => p.status === column.id) || [];
              return (
                <div
                  key={column.id}
                  className={`flex flex-col w-72 shrink-0 min-h-[500px] rounded-2xl bg-white border-t-4 ${column.color} shadow-sm border-x border-b border-gray-200`}
                  onDragOver={handlePipelineDragOver}
                  onDrop={(e) => handlePipelineDrop(e, column.id)}
                >
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-700">{column.label}</h3>
                    <div className="flex items-center gap-2">
                      {column.id === "backlog" && isManagerOrAbove && (
                        <button
                          type="button"
                          onClick={openCreateTaskModal}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                          title="Add task"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500">
                        {posts.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {posts.map((post) => (
                      <ContentItem
                        key={post.id}
                        post={post}
                        isAdmin={true}
                        onDragStart={handlePipelineDragStart}
                        onSchedule={handleScheduleById}
                        onRefresh={fetchPipeline}
                        renderModal={false}
                        onOpen={(p) => setOpenContentItemId(p.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
          <Kanban size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium">Select a client to view their content pipeline</p>
        </div>
      )}

      {/* Keep the modal mounted outside the columns so it doesn't close when the item moves columns */}
      {openContentItemId != null &&
        (() => {
          if (!selectedPipelineClient) return null;
          const list = pipelineData[selectedPipelineClient] || [];
          const openPost = list.find((p) => p.id === openContentItemId);
          if (!openPost) return null;
          return (
            <ContentItem
              key={openPost.id}
              post={openPost}
              isAdmin={true}
              hideCard={true}
              open={true}
              onOpenChange={(open) => {
                if (!open) setOpenContentItemId(null);
              }}
              onSchedule={handleScheduleById}
              onRefresh={fetchPipeline}
            />
          );
        })()}

      <CreateTaskModal
        open={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        title={createTaskTitle}
        onTitleChange={setCreateTaskTitle}
        serviceId={createTaskServiceId}
        onServiceIdChange={setCreateTaskServiceId}
        invoiceId={createTaskInvoiceId}
        onInvoiceIdChange={setCreateTaskInvoiceId}
        services={createTaskServices}
        invoices={createTaskInvoices}
        loading={createTaskLoading}
        error={createTaskError}
        onSubmit={submitCreateTask}
      />
    </div>
  );
};

export default PipelineTab;
