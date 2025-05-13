import { Link } from "@tanstack/react-router";
import { Box, Button, Typography, Container, Paper } from "@mui/material";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Layout from "../components/Layout";

export default function NotFound() {
  return (
    <Layout title="Page Not Found">
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <AlertTriangle size={64} color="#f59e0b" />
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500 }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </Typography>
          <Button
            component={Link}
            to="/"
            variant="contained"
            startIcon={<ArrowLeft size={18} />}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    </Layout>
  );
}