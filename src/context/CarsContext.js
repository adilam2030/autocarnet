// src/context/CarsContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToCars, addCar, updateCar, deleteCar, archiveCar,
  subscribeToOps, addOperation, deleteOperation,
} from '../utils/firebase';

const CarsContext = createContext(null);

export const CarsProvider = ({ children }) => {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [operations, setOperations] = useState({}); // { carId: [ops] }
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('synced'); // synced | pending | error

  // ── Subscribe to cars ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setCars([]); setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToCars((data) => {
      setCars(data.filter((c) => !c.archived));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  // ── Subscribe to operations per car ───────────────────────────────────────
  const subscribeCarOps = useCallback((carId) => {
    return subscribeToOps(carId, (ops) => {
      setOperations((prev) => ({ ...prev, [carId]: ops }));
    });
  }, []);

  // ── Car CRUD ───────────────────────────────────────────────────────────────
  const createCar = async (data) => {
    setSyncStatus('pending');
    try {
      await addCar(data);
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  const editCar = async (carId, data) => {
    setSyncStatus('pending');
    try {
      await updateCar(carId, data);
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  const removeCar = async (carId) => {
    setSyncStatus('pending');
    try {
      await deleteCar(carId);
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  const archive = async (carId) => {
    setSyncStatus('pending');
    try {
      await archiveCar(carId);
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  const updateKm = async (carId, newKm) => {
    await editCar(carId, { km: newKm, kmUpdatedAt: new Date().toISOString() });
  };

  // ── Operations CRUD ────────────────────────────────────────────────────────
  const createOperation = async (data) => {
    setSyncStatus('pending');
    try {
      await addOperation(data);
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  const removeOperation = async (opId) => {
    setSyncStatus('pending');
    try {
      await deleteOperation(opId);
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
      throw e;
    }
  };

  return (
    <CarsContext.Provider value={{
      cars, operations, loading, syncStatus,
      createCar, editCar, removeCar, archive, updateKm,
      createOperation, removeOperation, subscribeCarOps,
    }}>
      {children}
    </CarsContext.Provider>
  );
};

export const useCars = () => useContext(CarsContext);
