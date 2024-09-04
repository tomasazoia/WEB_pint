import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fullcalendar/daygrid';
import '@fullcalendar/timegrid';
import '@fullcalendar/list';
import ptLocale from '@fullcalendar/core/locales/pt';

const CalendarioEventos = () => {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        fetchEventos();
    }, []);

    const fetchEventos = async () => {
        try {
            // Obtendo o token de autenticação armazenado no sessionStorage
            const token = sessionStorage.getItem('token');
            
            if (!token) throw new Error('Token de autenticação não encontrado.');
    
            // Fazendo a solicitação para obter o perfil do usuário autenticado
            const userProfileResponse = await axios.get('https://pint-backend-5gz8.onrender.com/user/profile', {
                headers: {
                    'x-auth-token': token
                }
            });
    
            const userId = userProfileResponse.data.ID_FUNCIONARIO;  // ID do usuário    
            // Verificando se os IDs foram obtidos corretamente
            if (!userId) throw new Error('Erro ao obter dados do usuário ou centro.');
    
            // Fazendo a solicitação para listar os eventos disponíveis no centro do usuário
            const response = await axios.get(`https://pint-backend-5gz8.onrender.com/evento/listdispcal/${userId}`);
            const eventosFormatados = response.data.map(evento => ({
                id: evento.ID_EVENTO,
                title: evento.NOME_EVENTO,
                start: evento.DATA_EVENTO,
                allDay: true,
            }));
            setEventos(eventosFormatados);
        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
        }
            
    };

    return (
        <div className="container mt-1">
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
            />
        </div>
    );
};

export default CalendarioEventos;
