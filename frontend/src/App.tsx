import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ItemList from './components/ItemList';
import ItemDetails from './components/ItemDetails';
import AddItemForm from './components/AddItemForm';
import EditItem from './components/EditItem';
import Navbar from './components/Navbar';
import ConnectionTest from './components/ConnectionTest';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/item/:id/edit" element={<EditItem />} />
        <Route path="/add" element={<AddItemForm />} />
        <Route path="/debug" element={<ConnectionTest />} />
      </Routes>
    </Router>
  );
};

export default App;