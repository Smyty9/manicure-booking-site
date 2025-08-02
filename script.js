// Global variables
let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;
let selectedService = null;
let bookings = []; // Store booked slots

// DOM elements
const calendarDays = document.getElementById('calendarDays');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const timeModal = document.getElementById('timeModal');
const bookingModal = document.getElementById('bookingModal');
const successModal = document.getElementById('successModal');
const closeTimeModal = document.getElementById('closeTimeModal');
const closeBookingModal = document.getElementById('closeBookingModal');
const closeSuccessModal = document.getElementById('closeSuccessModal');
const timeSlots = document.getElementById('timeSlots');
const selectedDateElement = document.getElementById('selectedDate');
const bookingForm = document.getElementById('bookingForm');
const summaryDate = document.getElementById('summaryDate');
const summaryTime = document.getElementById('summaryTime');
const summaryService = document.getElementById('summaryService');
const newBookingBtn = document.getElementById('newBookingBtn');
const serviceTypeSelect = document.getElementById('serviceType');

// Webhook URL - замените на ваш домен Beget
const WEBHOOK_URL = 'https://your-domain.beget.com/webhook-test/c31eacd5-e2d4-4bbd-b62f-647e52ebc493';

// Available time slots (9:00 to 19:00, every hour)
const availableTimeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];

// Working hours (Monday to Saturday, 9:00-19:00)
const workingDays = [1, 2, 3, 4, 5, 6]; // Monday = 1, Sunday = 0
const workingHours = {
    start: 9,
    end: 19
};

// Service prices mapping
const servicePrices = {
    'classic-manicure': 'Классический маникюр - 1500 ₽',
    'gel-manicure': 'Маникюр с гель-лаком - 2500 ₽',
    'strengthening': 'Маникюр с укреплением - 3000 ₽',
    'extensions': 'Наращивание ногтей - 4000 ₽',
    'classic-pedicure': 'Классический педикюр - 2000 ₽',
    'gel-pedicure': 'Педикюр с покрытием - 3000 ₽',
    'spa-pedicure': 'SPA педикюр - 3500 ₽'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderCalendar();
    setupEventListeners();
    loadBookings(); // Load existing bookings from localStorage
});

// Setup event listeners
function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Modal close buttons
    closeTimeModal.addEventListener('click', () => {
        timeModal.classList.remove('show');
    });

    closeBookingModal.addEventListener('click', () => {
        bookingModal.classList.remove('show');
    });

    closeSuccessModal.addEventListener('click', () => {
        successModal.classList.remove('show');
    });

    // Close modals when clicking outside
    timeModal.addEventListener('click', (e) => {
        if (e.target === timeModal) {
            timeModal.classList.remove('show');
        }
    });

    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('show');
        }
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('show');
        }
    });

    // Form submission
    bookingForm.addEventListener('submit', handleBookingSubmission);

    // New booking button
    newBookingBtn.addEventListener('click', () => {
        successModal.classList.remove('show');
        resetForm();
    });

    // Service selection change
    serviceTypeSelect.addEventListener('change', (e) => {
        selectedService = e.target.value;
        updateServiceSummary();
    });
}

// Render calendar
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month display
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Convert Sunday to 7 for Monday start

    // Clear calendar
    calendarDays.innerHTML = '';

    // Add empty cells for days before first day of month
    for (let i = 1; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarDays.appendChild(emptyDay);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day current-month';
        dayElement.textContent = day;

        const currentDayDate = new Date(year, month, day);
        
        // Check if it's today
        const today = new Date();
        if (currentDayDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Check if it's a working day and not in the past
        if (isWorkingDay(currentDayDate) && !isPastDate(currentDayDate)) {
            dayElement.addEventListener('click', () => {
                selectDate(currentDayDate);
            });
        } else {
            dayElement.classList.add('disabled');
            dayElement.style.opacity = '0.5';
            dayElement.style.cursor = 'not-allowed';
        }

        calendarDays.appendChild(dayElement);
    }
}

// Check if date is a working day
function isWorkingDay(date) {
    const dayOfWeek = date.getDay();
    return workingDays.includes(dayOfWeek);
}

// Check if date is in the past
function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
}

// Select date and show time modal
function selectDate(date) {
    selectedDate = date;
    
    // Update selected date display
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    selectedDateElement.textContent = date.toLocaleDateString('ru-RU', dateOptions);
    
    // Render time slots
    renderTimeSlots();
    
    // Show time modal
    timeModal.classList.add('show');
}

// Render time slots
function renderTimeSlots() {
    timeSlots.innerHTML = '';
    
    availableTimeSlots.forEach(time => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = time;
        
        // Check if this slot is already booked
        const slotKey = `${selectedDate.toDateString()}-${time}`;
        if (isSlotBooked(slotKey)) {
            timeSlot.classList.add('disabled');
            timeSlot.textContent = `${time} (Занято)`;
        } else {
            timeSlot.addEventListener('click', () => {
                selectTime(time);
            });
        }
        
        timeSlots.appendChild(timeSlot);
    });
}

// Select time and show booking modal
function selectTime(time) {
    selectedTime = time;
    
    // Update summary
    updateBookingSummary();
    
    // Close time modal and show booking modal
    timeModal.classList.remove('show');
    bookingModal.classList.add('show');
}

// Update booking summary
function updateBookingSummary() {
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    summaryDate.textContent = selectedDate.toLocaleDateString('ru-RU', dateOptions);
    summaryTime.textContent = selectedTime;
    updateServiceSummary();
}

// Update service summary
function updateServiceSummary() {
    if (selectedService && servicePrices[selectedService]) {
        summaryService.textContent = servicePrices[selectedService];
    } else {
        summaryService.textContent = 'Не выбрано';
    }
}

// Handle booking form submission
async function handleBookingSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(bookingForm);
    const bookingData = {
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        service: selectedService || 'Не выбрано',
        serviceName: servicePrices[selectedService] || 'Не выбрано',
        clientName: formData.get('clientName'),
        clientPhone: formData.get('clientPhone'),
        clientTelegram: formData.get('clientTelegram') || '',
        timestamp: new Date().toISOString()
    };
    
    try {
        // Show loading state
        const submitBtn = bookingForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        // Send to webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });
        
        if (response.ok) {
            // Save booking locally
            saveBooking(bookingData);
            
            // Show success modal
            bookingModal.classList.remove('show');
            successModal.classList.add('show');
            
            // Reset form
            resetForm();
        } else {
            throw new Error('Ошибка отправки данных');
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        alert('Произошла ошибка при отправке записи. Пожалуйста, попробуйте еще раз.');
    } finally {
        // Reset button state
        const submitBtn = bookingForm.querySelector('.submit-btn');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Save booking to localStorage
function saveBooking(bookingData) {
    const slotKey = `${selectedDate.toDateString()}-${selectedTime}`;
    bookings.push({
        ...bookingData,
        slotKey: slotKey
    });
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Load bookings from localStorage
function loadBookings() {
    const savedBookings = localStorage.getItem('bookings');
    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }
}

// Check if slot is booked
function isSlotBooked(slotKey) {
    return bookings.some(booking => booking.slotKey === slotKey);
}

// Reset form
function resetForm() {
    bookingForm.reset();
    selectedDate = null;
    selectedTime = null;
    selectedService = null;
    summaryService.textContent = 'Не выбрано';
}

// Utility function to format date
function formatDate(date) {
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
} 