import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Profile.css";

export function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/user/details`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        throw new Error(response.data.msg || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch user details.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate, toast]);

  const calculateAmount = (duration) => {
    return duration * 100; // ₹100 per hour
  };

  const handleCheckout = async (reservationId, duration) => {
    const amount = calculateAmount(duration);
    
    const confirmed = window.confirm(
      `Checkout Summary:\n\nDuration: ${duration} hours\nRate: ₹100 per hour\nTotal Amount: ₹${amount}\n\nDo you want to proceed with checkout?`
    );
    
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/parking/checkout`,
        {
          reservationId,
          amount,
          duration
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "Checkout Successful",
          description: `Payment of ₹${amount} processed successfully`,
        });
        fetchUserData(); // Refresh data
      } else {
        throw new Error(response.data.msg || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to checkout",
        variant: "destructive",
      });
    }
  };

  const renderReservationCard = (reservation) => (
    <div key={reservation.id} className="bg-muted p-4 rounded-lg shadow">
      <div className="space-y-2">
        <div className="text-sm font-medium">
          Slot Number: {reservation.parkingSlot?.slotNumber || 'N/A'}
        </div>
        <div className="text-sm text-muted-foreground">
          Vehicle: {reservation.vehicleNumberPlate}
        </div>
        <div className="text-sm text-muted-foreground">
          Start: {new Date(reservation.reservationTime).toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          End: {new Date(reservation.endTime).toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          Duration: {reservation.duration} hours
        </div>
        <div className="text-sm text-muted-foreground">
          Status: {reservation.status}
        </div>
        {reservation.status === 'confirmed' && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-blue-600">
              Expected Amount: ₹{calculateAmount(reservation.duration)}
            </div>
            <Button
              onClick={() => handleCheckout(reservation.id, reservation.duration)}
              className="w-full bg-[var(--text-secondary)] hover:bg-opacity-90 text-[var(--text-light)]"
            >
              Checkout and Pay ₹{calculateAmount(reservation.duration)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!userData) {
    return <div className="flex items-center justify-center min-h-screen">No user data available.</div>;
  }

  const { user, reservations } = userData;

  return (
    <div className="main_container_profile min-h-screen p-4">
      <div className="container mx-auto">
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={user.name} readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={user.phoneNumber || "Not provided"}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Reservations</Label>
                {reservations && reservations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reservations.map(reservation => renderReservationCard(reservation))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reservations found
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
