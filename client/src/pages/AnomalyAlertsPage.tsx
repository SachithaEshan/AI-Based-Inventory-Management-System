// import React, { useEffect, useState } from 'react';
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Typography,
//   Chip,
//   Alert,
//   CircularProgress,
//   Modal,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableRow,
//   Paper,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from '@mui/material';
// import { api } from '../services/api';

// interface AnomalyAlert {
//   _id: string;
//   type: string;
//   productId: string;
//   productName?: string;
//   description: string;
//   severity: 'Low' | 'Medium' | 'High';
//   timestamp: string;
//   value: number;
//   threshold: number;
// }

// interface Product {
//   _id: string;
//   name: string;
// }

// const AnomalyAlertsPage: React.FC = () => {
//   const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [detecting, setDetecting] = useState(false);
//   const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [alertToDelete, setAlertToDelete] = useState<AnomalyAlert | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   const fetchAlerts = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/anomaly');
//       // Ensure response.data is an array
//       const alertsData = Array.isArray(response.data) ? response.data : [];
      
//       // Fetch product names for each alert
//       const alertsWithProductNames = await Promise.all(
//         alertsData.map(async (alert) => {
//           try {
//             const productResponse = await api.get(`/products/${alert.productId}`);
//             const productData = productResponse.data.data; // Access the nested data property
//             return {
//               ...alert,
//               productName: productData.name
//             };
//           } catch (err) {
//             console.error(`Failed to fetch product name for ${alert.productId}:`, err);
//             return alert;
//           }
//         })
//       );

//       setAlerts(alertsWithProductNames);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch anomaly alerts');
//       setAlerts([]); // Reset alerts to empty array on error
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDetectAnomalies = async () => {
//     try {
//       setDetecting(true);
//       await api.post('/anomaly/detect');
//       await fetchAlerts();
//       setError(null);
//     } catch (err) {
//       setError('Failed to detect anomalies');
//     } finally {
//       setDetecting(false);
//     }
//   };

//   const handleDeleteClick = (event: React.MouseEvent, alert: AnomalyAlert) => {
//     event.stopPropagation(); // Prevent card click event
//     setAlertToDelete(alert);
//     setDeleteDialogOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!alertToDelete) return;

//     try {
//       setDeleting(true);
//       await api.delete(`/anomaly/${alertToDelete._id}`);
//       setAlerts(alerts.filter(alert => alert._id !== alertToDelete._id));
//       setDeleteDialogOpen(false);
//       setAlertToDelete(null);
//     } catch (err) {
//       setError('Failed to delete anomaly alert');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const handleDeleteCancel = () => {
//     setDeleteDialogOpen(false);
//     setAlertToDelete(null);
//   };

//   useEffect(() => {
//     fetchAlerts();
//   }, []);

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'High':
//         return 'error';
//       case 'Medium':
//         return 'warning';
//       case 'Low':
//         return 'info';
//       default:
//         return 'default';
//     }
//   };

//   const handleCardClick = (alert: AnomalyAlert) => {
//     setSelectedAlert(alert);
//   };

//   const handleCloseModal = () => {
//     setSelectedAlert(null);
//   };

//   const DetailModal = ({ alert, open, onClose }: { alert: AnomalyAlert; open: boolean; onClose: () => void }) => {
//     return (
//       <Modal
//         open={open}
//         onClose={onClose}
//         aria-labelledby="anomaly-detail-modal"
//         aria-describedby="anomaly-detail-description"
//       >
//         <Box sx={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           width: '80%',
//           maxWidth: 600,
//           bgcolor: 'background.paper',
//           boxShadow: 24,
//           p: 4,
//           borderRadius: 2,
//           maxHeight: '90vh',
//           overflow: 'auto'
//         }}>
//           <Typography variant="h5" component="h2" gutterBottom>
//             Anomaly Details
//           </Typography>
//           <TableContainer component={Paper}>
//             <Table>
//               <TableBody>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Type</TableCell>
//                   <TableCell>{alert.type}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Product</TableCell>
//                   <TableCell>{alert.productName || alert.productId}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Severity</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={alert.severity}
//                       color={getSeverityColor(alert.severity)}
//                       size="small"
//                     />
//                   </TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Description</TableCell>
//                   <TableCell>{alert.description}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Value</TableCell>
//                   <TableCell>{alert.value}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Threshold</TableCell>
//                   <TableCell>{alert.threshold}</TableCell>
//                 </TableRow>
//                 <TableRow>
//                   <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
//                   <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </TableContainer>
//           <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
//             <Button onClick={onClose} variant="contained">
//               Close
//             </Button>
//           </Box>
//         </Box>
//       </Modal>
//     );
//   };

//   return (
//     <Box p={3}>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Typography variant="h4">Anomaly Detection</Typography>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleDetectAnomalies}
//           disabled={detecting}
//         >
//           {detecting ? <CircularProgress size={24} /> : 'Detect Anomalies'}
//         </Button>
//       </Box>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {loading ? (
//         <Box display="flex" justifyContent="center" p={3}>
//           <CircularProgress />
//         </Box>
//       ) : alerts.length === 0 ? (
//         <Box display="flex" justifyContent="center" p={3}>
//           <Typography variant="h6" color="textSecondary">
//             No anomalies detected
//           </Typography>
//         </Box>
//       ) : (
//         <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={3}>
//           {alerts.map((alert) => (
//             <Card 
//               key={alert._id}
//               onClick={() => handleCardClick(alert)}
//               sx={{ 
//                 cursor: 'pointer',
//                 transition: 'transform 0.2s',
//                 '&:hover': {
//                   transform: 'scale(1.02)',
//                   boxShadow: 3
//                 }
//               }}
//             >
//               <CardContent>
//                 <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                   <Typography variant="h6">{alert.type}</Typography>
//                   <Box display="flex" alignItems="center" gap={1}>
//                     <Chip
//                       label={alert.severity}
//                       color={getSeverityColor(alert.severity)}
//                       size="small"
//                     />
//                     <Button
//                       size="small"
//                       color="error"
//                       onClick={(e) => handleDeleteClick(e, alert)}
//                       sx={{ 
//                         minWidth: 'auto',
//                         p: 0.5,
//                         '&:hover': { backgroundColor: 'error.light' }
//                       }}
//                     >
//                       Delete
//                     </Button>
//                   </Box>
//                 </Box>
//                 <Typography color="textSecondary" gutterBottom>
//                   Product: {alert.productName || alert.productId}
//                 </Typography>
//                 <Typography variant="body2" paragraph>
//                   {alert.description}
//                 </Typography>
//                 <Box display="flex" justifyContent="space-between">
//                   <Typography variant="body2" color="textSecondary">
//                     Value: {alert.value}
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Threshold: {alert.threshold}
//                   </Typography>
//                 </Box>
//                 <Typography variant="caption" color="textSecondary" display="block" mt={1}>
//                   {new Date(alert.timestamp).toLocaleString()}
//                 </Typography>
//               </CardContent>
//             </Card>
//           ))}
//         </Box>
//       )}

//       {selectedAlert && (
//         <DetailModal
//           alert={selectedAlert}
//           open={!!selectedAlert}
//           onClose={handleCloseModal}
//         />
//       )}

//       <Dialog
//         open={deleteDialogOpen}
//         onClose={handleDeleteCancel}
//         aria-labelledby="delete-dialog-title"
//       >
//         <DialogTitle id="delete-dialog-title">Delete Anomaly Alert</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Are you sure you want to delete this anomaly alert? This action cannot be undone.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeleteCancel} disabled={deleting}>
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleDeleteConfirm} 
//             color="error" 
//             variant="contained"
//             disabled={deleting}
//           >
//             {deleting ? <CircularProgress size={24} /> : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default AnomalyAlertsPage; 

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { api } from '../services/api';

interface AnomalyAlert {
  _id: string;
  type: string;
  productId: string;
  productName?: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  timestamp: string;
  value: number;
  threshold: number;
}

const AnomalyAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<AnomalyAlert | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/anomaly');
      const alertsData = Array.isArray(response.data) ? response.data : [];
      
      const enriched = await Promise.all(
        alertsData.map(async (alert) => {
          try {
            const productResponse = await api.get(`/products/${alert.productId}`);
            return { ...alert, productName: productResponse.data.data.name };
          } catch {
            return alert;
          }
        })
      );

      setAlerts(enriched);
      setError(null);
    } catch (err) {
      setError('Failed to fetch anomaly alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectAnomalies = async () => {
    try {
      setDetecting(true);
      await api.post('/anomaly/detect');
      await fetchAlerts();
    } catch {
      setError('Failed to detect anomalies');
    } finally {
      setDetecting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, alert: AnomalyAlert) => {
    e.stopPropagation();
    setAlertToDelete(alert);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!alertToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/anomaly/${alertToDelete._id}`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertToDelete._id));
      setDeleteDialogOpen(false);
    } catch {
      setError('Failed to delete alert');
    } finally {
      setDeleting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'High') return 'error';
    if (severity === 'Medium') return 'warning';
    return 'info';
  };

  const DetailModal = ({
    alert,
    open,
    onClose,
  }: { alert: AnomalyAlert; open: boolean; onClose: () => void }) => (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper', p: 4, borderRadius: 3,
        boxShadow: 24, width: 500, maxHeight: '90vh', overflow: 'auto'
      }}>
        <Typography variant="h5" mb={2}>Anomaly Details</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <RowItem label="Type" value={alert.type} />
              <RowItem label="Product" value={alert.productName || alert.productId} />
              <RowItem label="Severity" value={
                <Chip label={alert.severity} color={getSeverityColor(alert.severity)} size="small" />
              } />
              <RowItem label="Description" value={alert.description} />
              <RowItem label="Value" value={alert.value} />
              <RowItem label="Threshold" value={alert.threshold} />
              <RowItem label="Timestamp" value={new Date(alert.timestamp).toLocaleString()} />
            </TableBody>
          </Table>
        </TableContainer>
        <Box textAlign="right" mt={2}>
          <Button variant="contained" onClick={onClose}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );

  const RowItem = ({ label, value }: { label: string; value: any }) => (
    <TableRow>
      <TableCell sx={{ fontWeight: 'bold' }}>{label}</TableCell>
      <TableCell>{value}</TableCell>
    </TableRow>
  );

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Anomaly Detection</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDetectAnomalies}
          disabled={detecting}
          startIcon={detecting ? <CircularProgress size={20} /> : undefined}
        >
          {detecting ? 'Detecting...' : 'Detect Anomalies'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
      ) : alerts.length === 0 ? (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="text.secondary">
            No anomalies detected
          </Typography>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(320px, 1fr))" gap={3}>
          {alerts.map((alert) => (
            <Card
              key={alert._id}
              onClick={() => setSelectedAlert(alert)}
              sx={{
                p: 2,
                transition: '0.3s',
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 5 }
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">{alert.type}</Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={alert.severity}
                      color={getSeverityColor(alert.severity)}
                      size="small"
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={(e) => handleDeleteClick(e, alert)}
                      sx={{ minWidth: 'auto', p: 0 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Product: {alert.productName || alert.productId}
                </Typography>
                <Typography variant="body2" mb={2}>
                  {alert.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" fontSize="small">
                  <Typography color="text.secondary">Value: {alert.value}</Typography>
                  <Typography color="text.secondary">Threshold: {alert.threshold}</Typography>
                </Box>
                <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {selectedAlert && (
        <DetailModal
          alert={selectedAlert}
          open={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Alert</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this anomaly alert? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnomalyAlertsPage;
