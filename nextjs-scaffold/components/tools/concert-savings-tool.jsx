"use client";

import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import { T, fontDisplay, fontBody } from "@/lib/design-tokens";
import { fmtEUR, useAnimatedNumber } from "@/lib/hooks";
import { Card, AdviceBlock, ProgressBar, DecimalSliderRow } from "@/components/ui";
import ToolHeader from "@/components/ToolHeader";
import { CopySummaryButton, ExportCSVButton } from "@/components/ExportActions";
import RelatedTools from "@/components/RelatedTools";
import AdSlot from "@/components/AdSlot";
import { MAX_FINANCIAL_LIMIT } from "@/lib/financial-constants";

const CITIES = [
  { id: "london", name: "Londres", flightEst: 180, hotelEst: 350 },
  { id: "madrid", name: "Madrid", flightEst: 90, hotelEst: 220 },
  { id: "paris", name: "París", flightEst: 140, hotelEst: 300 },
  { id: "berlin", name: "Berlín", flightEst: 130, hotelEst: 260 },
];

const TICKET_TYPES = [
  { id: "general", name: "Entrada General", base: 85 },
  { id: "vip", name: "VIP Golden Circle", base: 195 },
  { id: "meet", name: "Meet & Greet + VIP", base: 380 },
];

function toCents(val) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

function fromCents(cents) {
  const num = Number(cents);
  return Number.isFinite(num) ? num / 100 : 0;
}

export default function ConcertSavingsTool({ onBack, onNavigate }) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "https://metabox.app/herramientas/ahorro-concierto";
  const pageDescription = "Planifica tu ahorro para el concierto y viaje VIP de tu artista favorito con desglose total y cuenta atrás.";

  // Estados principales de la herramienta
  const [artistName, setArtistName] = useState("The Weeknd");
  const [selectedCityId, setSelectedCityId] = useState("london");
  const [ticketTypeId, setTicketTypeId] = useState("vip");
  const [customTicketPrice, setCustomTicketPrice] = useState(195);
  const [flightCost, setFlightCost] = useState(180);
  const [hotelCost, setHotelCost] = useState(350);
  const [extrasCost, setExtrasCost] = useState(90); // Merchandising / consumiciones
  const [monthsToEvent, setMonthsToEvent] = useState(6);
  const [currentSaved, setCurrentSaved] = useState(150);

  // Sincronizar estimaciones al cambiar de ciudad o tipo de entrada
  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    const city = CITIES.find((c) => c.id === cityId);
    if (city) {
      setFlightCost(city.flightEst);
      setHotelCost(city.hotelEst);
    }
  };

  const handleTicketTypeChange = (typeId) => {
    setTicketTypeId(typeId);
    const t = TICKET_TYPES.find((item) => item.id === typeId);
    if (t) {
      setCustomTicketPrice(t.base);
    }
  };

  // Cálculos matemáticos rigurosos en céntimos
  const ticketCents = toCents(customTicketPrice);
  const flightCents = toCents(flightCost);
  const hotelCents = toCents(hotelCost);
  const extrasCents = toCents(extrasCost);
  
  const totalGoalCents = ticketCents + flightCents + hotelCents + extrasCents;
  const savedCents = toCents(currentSaved);

  const monthsCount = Math.max(1, Number(monthsToEvent) || 1);
  const monthlyTargetCents = Math.round(Math.max(0, totalGoalCents - savedCents) / monthsCount);

  const yearPct = totalGoalCents > 0 ? Math.min(100, Math.max(0, (savedCents / totalGoalCents) * 100)) : 0;
  const isGoalAchieved = savedCents >= totalGoalCents;

  const FAQS = [
    {
      q: "¿Cómo se calcula el ahorro mensual para el concierto?",
      a: "Se resta lo que ya tienes ahorrado del coste total del pack (entradas, vuelos, hotel y extras) y se divide de forma equitativa entre los meses restantes hasta el evento."
    }
  ];

