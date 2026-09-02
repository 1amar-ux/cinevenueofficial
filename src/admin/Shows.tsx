import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Shows() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState<any[]>([
    {
      _id: "show1",
      movie: { title: "Pushpa 2" },
      theatre: { name: "PVR Cinemas" },
      date: "2026-06-25",
      time: "07:00 PM",
      price: 250,
      status: "Active"
    },
    {
      _id: "show2",
      movie: { title: "Salaar" },
      theatre: { name: "INOX" },
      date: "2026-06-25",
      time: "09:30 PM",
      price: 300,
      status: "Active"
    }
  ]);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await api.get("/admin/show/list");
      if (res.data && res.data.length > 0) {
        setShows(res.data);
      }
    } catch (err) {
      console.log("No remote shows found, utilizing local fallback state", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteShow = async (id: string) => {
    if (!window.confirm("Delete this show?")) return;

    try {
      await api.delete(`/admin/show/${id}`);
      fetchShows();
    } catch (err) {
      console.log(err);
      // Remove local copy if API request fails
      setShows((prev) => prev.filter((s) => s._id !== id));
      alert("Deleted successfully");
    }
  };

  const columns = [
    {
      field: "movie",
      headerName: "Movie",
      width: 220,
      renderCell: (params: any) => params.row.movie?.title || "N/A"
    },
    {
      field: "theatre",
      headerName: "Theatre",
      width: 220,
      renderCell: (params: any) => params.row.theatre?.name || "N/A"
    },
    {
      field: "date",
      headerName: "Date",
      width: 130
    },
    {
      field: "time",
      headerName: "Time",
      width: 120
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: (params: any) => <>₹ {params.row.price}</>
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params: any) => (
        <Chip
          label={params.row.status}
          color={params.row.status === "Active" ? "success" : "warning"}
        />
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderCell: (params: any) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            color="primary"
            onClick={() => navigate(`/admin/edit-show/${params.row._id}`)}
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => deleteShow(params.row._id)}
          >
            <Delete />
          </IconButton>
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Shows Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => alert("Add Show (Simulation)")}
          sx={{ backgroundColor: "#222539", "&:hover": { backgroundColor: "#151724" } }}
        >
          Add Show
        </Button>
      </Stack>

      <Box sx={{ width: "100%", height: 400 }}>
        <DataGrid
          rows={shows}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5
              }
            }
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </Box>
    </Box>
  );
}
