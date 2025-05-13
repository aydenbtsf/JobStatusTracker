import { Box, Container, Typography, Card, CardContent, Button } from "@mui/material";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Box sx={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default"
    }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
              <AlertCircle size={32} color="#ef4444" />
              <Typography variant="h4" component="h1" fontWeight="bold">
                404 Page Not Found
              </Typography>
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              The page you are looking for doesn't exist or has been moved.
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Button 
                component={Link} 
                href="/" 
                variant="contained" 
                color="primary"
              >
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
