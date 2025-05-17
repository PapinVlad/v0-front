"use client"

import React, { useState, useEffect } from "react";
import { isAuthenticated, getCurrentUser } from "../utils/auth";
import api from "../utils/api";

const NewsletterPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(null); // null - проверка, true - подписан, false - не подписан
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState({
    events: true,
    badges: true,
    general: true,
  });

  const isAuth = isAuthenticated();

  // Pre-fill form and check subscription status
  useEffect(() => {
    const fetchUserDataAndCheckSubscription = async () => {
      let userEmail = "";
      let userName = "";

      // Pre-fill form if authenticated
      if (isAuth) {
        try {
          const { user } = await getCurrentUser();
          userEmail = user.email || "";
          userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "";
          setEmail(userEmail);
          setName(userName);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }

      // Check subscription status
      try {
        const response = await api.get("/newsletters/check-subscription", {
          params: { email: userEmail || email },
        });
        console.log("Check subscription response:", response.data);
        setSubscribed(response.data.isSubscribed);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setError(
          error.response?.data?.message ||
          "Failed to check subscription status. Please try again later."
        );
      }
    };

    fetchUserDataAndCheckSubscription();
  }, [isAuth, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!email || !name) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Prepare data for API call
    const subscriptionData = {
      email,
      firstName: name.split(" ")[0] || "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      preferences,
    };

    try {
      const response = await api.post("/newsletters/subscribe", subscriptionData);
      console.log("Subscription response:", response.data);
      setSubscribed(true);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setError(
        error.response?.data?.message ||
        "Failed to subscribe. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/newsletters/unsubscribe", { email });
      console.log("Unsubscribe response:", response.data);
      setSubscribed(false);
    } catch (error) {
      console.error("Error unsubscribing from newsletter:", error);
      setError(
        error.response?.data?.message ||
        "Failed to unsubscribe. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Initial loading state while checking subscription
  if (subscribed === null) {
    return <div className="newsletter-page">Checking subscription status...</div>;
  }

  // If already subscribed
  if (subscribed) {
    return (
      <div className="newsletter-page">
        <h1>Newsletter Subscription</h1>
        <div className="subscription-status">
          <p>You are already subscribed to the Obanshire Cub Scouts newsletter.</p>
          <p>If you wish, you can unsubscribe below.</p>
          {error && <div className="error-message">{error}</div>}
          <button
            className="unsubscribe-button"
            onClick={handleUnsubscribe}
            disabled={loading}
          >
            {loading ? "Unsubscribing..." : "Unsubscribe"}
          </button>
        </div>
      </div>
    );
  }

  // If not subscribed
  return (
    <div className="newsletter-page">
      <h1>Subscribe to Our Newsletter</h1>
      <p>Stay updated with the latest news, events, and activities from Obanshire Cub Scouts.</p>

      {error && <div className="error-message">{error}</div>}

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <h3>Newsletter Preferences</h3>
          <p>Select the types of updates you'd like to receive:</p>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="events"
                checked={preferences.events}
                onChange={handlePreferenceChange}
              />
              Events and Activities
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="badges"
                checked={preferences.badges}
                onChange={handlePreferenceChange}
              />
              Badge Updates
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="general"
                checked={preferences.general}
                onChange={handlePreferenceChange}
              />
              General News
            </label>
          </div>
        </div>

        <button type="submit" className="subscribe-button" disabled={loading}>
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default NewsletterPage;