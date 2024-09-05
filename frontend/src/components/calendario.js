import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fullcalendar/daygrid';
import '@fullcalendar/timegrid';
import '@fullcalendar/list';
import ptLocale from '@fullcalendar/core/locales/pt';
import '../styles/styles.css'; // Importe o arquivo CSS personalizado

const CalendarioEventos = () => {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        fetchEventos();
    }, []);

    const fetchEventos = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) throw new Error('Token de autenticação não encontrado.');

            const userProfileResponse = await axios.get('https://pintfinal-backend.onrender.com/user/profile', {
                headers: { 'x-auth-token': token }
            });

            const userId = userProfileResponse.data.ID_FUNCIONARIO;
            if (!userId) throw new Error('Erro ao obter dados do usuário ou centro.');

            const response = await axios.get(`https://pintfinal-backend.onrender.com/evento/listdispcal/${userId}`);
            const eventosFormatados = response.data.map(evento => ({
                id: evento.ID_EVENTO,
                title: evento.NOME_EVENTO,
                start: new Date(evento.DATA_EVENTO).toISOString(), // Garante que a data seja no formato ISO 8601
                allDay: false // Define allDay como false para que horas sejam mostradas
            }));
            setEventos(eventosFormatados);
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
        }
    };

    return (
        <div className="calendar-container mt-1">
            <h1>Calendário de Eventos</h1>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={eventos}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={ptLocale}
                eventClick={(info) => alert(`Evento: ${info.event.title}`)}
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }}
            />
        </div>
    );
};

export default CalendarioEventos;
