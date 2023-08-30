import React from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DataTable from "../../tables/DataTable";

import EditTemplateDialog from "../dialogs/EditTemplateDialog";

import API from "@e2xauthoring/api";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { getTemplateUrl } from "../../../utils/urls";
import NavLink from "../../nav/NavLink";
import CopyTemplateDialog from "../dialogs/CopyTemplateDialog";
import { useConfirm } from "material-ui-confirm";

export default function TemplateTable() {
  const confirm = useConfirm();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openCopy, setOpenCopy] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState("");

  const load = () => {
    setLoading(true);
    API.templates.list().then((message) => {
      if (!message.success) {
        alert(message.error);
      } else {
        setRows(message.data);
        setLoading(false);
      }
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const deleteTemplate = React.useCallback((template) => () => {
    confirm({
      description: `Are you sure you want to delete the template ${template}?`,
      title: "Delete Template",
    }).then(() => {
      API.templates.remove(template).then((message) => {
        if (!message.success) {
          alert(message.error);
        }
        load();
      });
    });
  });

  const editTemplate = React.useCallback((template) => () => {
    setSelectedTemplate(template);
    setOpenEdit(true);
  });

  const copyTemplate = React.useCallback((template) => () => {
    setSelectedTemplate(template);
    setOpenCopy(true);
  });

  const columns = React.useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        renderCell: (params) => (
          <NavLink to={getTemplateUrl(params.row.name)}>
            {params.row.name}
          </NavLink>
        ),
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            title="Rename Template"
            color="primary"
            onClick={editTemplate(params.row.name)}
          />,
          <GridActionsCellItem
            key="copy"
            icon={<ContentCopyIcon />}
            label="Copy"
            title="Copy Template"
            color="primary"
            onClick={copyTemplate(params.row.name)}
          />,
          <GridActionsCellItem
            key="del"
            icon={<DeleteForeverIcon />}
            label="Delete"
            title="Delete Template"
            color="error"
            onClick={deleteTemplate(params.row.name)}
          />,
        ],
      },
    ],
    [deleteTemplate]
  );

  return (
    <>
      <DataTable
        rows={rows}
        loading={loading}
        columns={columns}
        getRowId={(row) => row.name}
        initialSort={{ field: "name", sort: "asc" }}
      />
      <EditTemplateDialog
        open={openEdit}
        setOpen={setOpenEdit}
        reload={load}
        template={selectedTemplate}
      />
      <CopyTemplateDialog
        open={openCopy}
        setOpen={setOpenCopy}
        reload={load}
        template={selectedTemplate}
      />
    </>
  );
}
