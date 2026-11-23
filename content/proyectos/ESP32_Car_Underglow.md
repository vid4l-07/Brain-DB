---
created: 2026-11-21
description: Proyecto de desarrollo e instalación de un sistema de iluminación LED direccionable para un coche, controlado mediante un ESP32-C3 e integrado con el cierre centralizado del vehículo para ejecutar animaciones personalizadas al bloquear y desbloquear.
---
El objetivo de este proyecto es desarrollar e instalar un sistema de iluminación animado en la parte inferior de mi coche, capaz de reaccionar a las acciones de bloqueo y desbloqueo del cierre centralizado.
Para ello, se utiliza un microcontrolador ESP32-C3 encargado de controlar las tiras LED y ejecutar diferentes animaciones en función de las señales recibidas del sistema de cierre.

![[leds_encendidos.png|380]]

# Hardware

Para este proyecto utilizaré los siguientes componentes:

| Componente                      | Función                                    |
| ------------------------------- | ------------------------------------------ |
| ESP32-C3 Super Mini             | Microcontrolador principal                 |
| Tira LED WS2811 a 12V (99 LEDs) | Elemento de iluminación                    |
| Conversor DC-DC 12V-5V          | Alimentación del ESP32                     |
| Conversor DC-DC 12V-3V          | Protección y adaptación de la entrada GPIO |
| Interruptor físico              | Mantener la tira encendida                 |
| Perfil aluminio              | Proteger la tira de la humedad                 |

# Identificación de señal de cierre y apertura

El primer paso es identificar la señal de activación de los intermitentes al abrir y cerrar el coche.

Anteriormente instalé un módulo de cierre centralizado, lo que me facilitó la localización de la señal.

En mi caso, al abrir se producen dos parpadeos y al cerrar uno, lo que utilizaré para crear una animación para cada caso.
![](cierre_centralizado.mp4)

# Planificación

## Voltajes

La idea es que la batería del coche va a 12V, igual que el módulo de cierre centralizado, por lo que habrá que transformar el voltaje para alimentar el ESP32 y sus pines.

Yo he decidido hacerlo con 2 conversores Buck de 3V y 5V. Pero otra opción para proteger los pines es usar un divisor resistivo, ya que el voltaje que sale del módulo de cierre centralizado es constante. Sin embargo, convertir el voltaje que alimenta el ESP32 mediante un divisor resistivo es un error, ya que la batería del coche puede aumentar hasta 14V, lo que puede provocar picos que dañarían el ESP32.

Para alimentar tanto el ESP32 como la tira LED hay que elegir una fuente de 12V constante, no solo bajo contacto. Si solo se alimentara bajo contacto no se podría realizar ninguna animación al abrir o cerrar el coche.

De esta forma, tendremos que controlar los LEDs completamente mediante el ESP32.

## Interruptor

La función del interruptor es conectar un pin del ESP32, en modo **PULL UP**, a tierra. De esta forma, nos ahorramos tener que convertir otro voltaje y se simplifica la instalación.

## Instalación de la tira LED

La instalación consta de una tira LED de 99 LEDs.

Cortaré la tira LED por la mitad e instalaré una mitad en cada lado del coche y las conectaré en paralelo; de esta forma, quedarán dos tiras simétricas que recorren todo el coche. Cada lado tendrá 49 LEDs.

Para instalar LEDs los colocaré dentro de un perfil de aluminio sellado con silicona para protegerlos de la humedad.

# Montaje

Después, soldé y monté los componentes en una caja:
![[circuito_en_caja.png|358]]

Durante las primeras pruebas, las tiras LED presentaban comportamientos irregulares, mostrando parpadeos y cambios de color no deseados.
![[led_fallando.mp4]]

Tras analizar el problema, comprobé que estaba relacionado con la integridad de la señal de datos. La señal de salida del ESP32 es de aproximadamente 3,3 V, lo que no proporcionaba suficiente margen al utilizar un cableado tan largo.

Para solucionarlo, incorporé un LED direccionable adicional al principio de la instalación. Su controlador WS2811 recibe la señal del microcontrolador y regenera la señal de datos para el resto de la tira.

Esta modificación solucionó los problemas de comunicación observados durante las pruebas.
![[led_bien.mp4]]

# Esquema

El esquema para la instalación es el siguiente.
![[scheme.png]]

# Firmware

El firmware está basado en la siguiente distribución de los pines y la librería **Adafruit NeoPixel**:
- `Gpio5`: Receptor de la señal del cierre centralizado.
- `Gpio6`: Salida de los datos que controlan el LED.
- `Gpio7`: Entrada del interruptor.

>[!Info]- Código
>```cpp
>#include <Adafruit_NeoPixel.h>
>
>#define LED_INPUT 5
>#define LED_PIN 6
>#define INTERRUPTOR 7
>#define NUM_LEDS 50 // 49 por lado + el que amplifica
>
>#define ANIM_DELAY 70
>
>#define DOUBLE_PRESS_TIME 1100
>#define DEBOUNCE_TIME 30
>
>Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);
>
>uint32_t color = strip.Color(255, 0, 50);
>
>// Funciones de brillo
>void set_brightness(uint8_t brillo) {
>    for (int i = 0; i < NUM_LEDS; i++) {
>        uint32_t c = color;
>
>        uint8_t r = (uint8_t)((uint8_t)(c >> 16) * brillo / 255);
>        uint8_t g = (uint8_t)((uint8_t)(c >> 8) * brillo / 255);
>        uint8_t b = (uint8_t)((uint8_t)c * brillo / 255);
>
>        strip.setPixelColor(i, r, g, b);
>    }
>
>    strip.show();
>}
>
>void set_brightness_pixel(uint8_t brillo, size_t pixel) {
>    uint32_t c = color;
>
>    uint8_t r = (uint8_t)((uint8_t)(c >> 16) * brillo / 255);
>    uint8_t g = (uint8_t)((uint8_t)(c >> 8) * brillo / 255);
>    uint8_t b = (uint8_t)((uint8_t)c * brillo / 255);
>
>    strip.setPixelColor(pixel, r, g, b);
>    strip.show();
>}
>
>// Animaciones
>void abrir() {
>    for (int i = 0; i < NUM_LEDS; i += 2) {
>        strip.setPixelColor(i, color);
>
>        if (i + 1 < NUM_LEDS) {
>            strip.setPixelColor(i + 1, color);
>        }
>
>        strip.show();
>        delay(50 - i);
>    }
>
>    encender();
>    delay(500);
>
>    for (int i = 0; i < NUM_LEDS; i += 2) {
>        strip.setPixelColor(i, 0, 0, 0);
>
>        if (i + 1 < NUM_LEDS) {
>            strip.setPixelColor(i + 1, 0, 0, 0);
>        }
>
>        strip.show();
>        delay(15);
>    }
>
>    apagar();
>}
>
>void cerrar() {
>    for (int i = NUM_LEDS - 1; i >= 0; i -= 2) {
>        strip.setPixelColor(i, color);
>
>        if (i + 1 < NUM_LEDS) {
>            strip.setPixelColor(i + 1, color);
>        }
>
>        strip.show();
>        delay(i);
>    }
>
>    encender();
>    delay(500);
>
>    for (int i = NUM_LEDS - 2; i >= 0; i -= 2) {
>        strip.setPixelColor(i, 0, 0, 0);
>
>        if (i + 1 < NUM_LEDS) {
>            strip.setPixelColor(i + 1, 0, 0, 0);
>        }
>
>        strip.show();
>        delay(15);
>    }
>
>    apagar();
>}
>
>void animacion_encender() {
>    int min_bright = 50;
>
>    for (int i = 0; i < NUM_LEDS; i++) {
>        set_brightness_pixel(min_bright, i);
>        delay(ANIM_DELAY);
>    }
>
>    for (int i = 50; i <= 255; i++) {
>        set_brightness(i);
>    }
>
>    encender();
>}
>
>void encender() {
>    for (int i = 0; i < NUM_LEDS; i++) {
>        strip.setPixelColor(i, color);
>    }
>
>    strip.show();
>}
>
>void apagar() {
>    strip.clear();
>    strip.show();
>}
>
>void apagar_lento() {
>    for (int i = 200; i >= 0; i--) {
>        set_brightness(i);
>    }
>
>    apagar();
>}
>
>// Lógica
>bool previous_state = LOW;
>
>int press_count = 0;
>
>unsigned long first_press_time = 0;
>unsigned long last_change_time = 0;
>
>bool on = false;
>
>void setup() {
>    pinMode(LED_INPUT, INPUT);
>    pinMode(INTERRUPTOR, INPUT_PULLUP);
>
>    strip.begin();
>    strip.setBrightness(255);
>    strip.clear();
>    strip.show();
>}
>
>void loop() {
>    bool interruptor = digitalRead(INTERRUPTOR);
>    unsigned long now = millis();
>
>    bool current_state = digitalRead(LED_INPUT);
>
>    // Interruptor
>    if (interruptor == LOW && !on) {
>        on = true;
>        animacion_encender();
>
>    } else if (interruptor == HIGH && on) {
>        on = false;
>        apagar_lento();
>    }
>
>    // Detectar cambio de estado
>    if (current_state != previous_state) {
>
>        // Debounce
>        if (now - last_change_time >= DEBOUNCE_TIME) {
>
>            last_change_time = now;
>
>            if (current_state == HIGH) {
>
>                press_count++;
>
>                if (press_count == 1) {
>                    first_press_time = now;
>                }
>            }
>
>            previous_state = current_state;
>        }
>    }
>
>    // Ha terminado el tiempo para contar pulsos
>    if (press_count > 0 && now - first_press_time >= DOUBLE_PRESS_TIME) {
>
>        if (press_count == 1) {
>            cerrar();
>        }
>        else if (press_count >= 2) {
>            abrir();
>        }
>
>        press_count = 0;
>    }
>}
>```

El funcionamiento se divide en dos subsistemas:
### Control de iluminación

Mediante la lectura del pin `INTERRUPTOR` configurado como `INPUT_PULLUP`, el programa determina cuándo debe encender o apagar la iluminación.
- La tira se enciende con la función `animacion_encender()`, que realiza un encendido progresivo, iluminando los LEDs individualmente con un brillo inicial de 50 y aumentando la intensidad hasta 255.
- Se apaga con la función `apagar_lento()`, que reduce progresivamente el brillo desde 200 hasta 0 antes de apagar la tira.

### Integración con el cierre centralizado

El programa monitoriza el pin `LED_INPUT` para detectar los pulsos generados por el sistema de cierre centralizado del vehículo.

Para identificar correctamente las señales, implementa un sistema de detección de flancos con antirrebote (*debouncing*) mediante `previous_state` y `last_change_time`, utilizando un intervalo de 30 ms (`DEBOUNCE_TIME`).

Los pulsos se contabilizan mediante `press_count` y se clasifican utilizando una ventana temporal de 1100 ms (`DOUBLE_PRESS_TIME`):

- **Un pulso:** ejecuta `cerrar()`, que ilumina progresivamente los LEDs desde el extremo final hacia el inicial, mantiene la iluminación durante 500 ms y realiza una secuencia de apagado.
- **Dos pulsos:** ejecuta `abrir()`, que ilumina progresivamente los LEDs desde el extremo inicial hacia el final, mantiene la iluminación durante 500 ms y posteriormente los apaga de forma secuencial.