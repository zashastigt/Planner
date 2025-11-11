import { ref, onMounted, onUnmounted } from 'vue'

export function useMouseHold() {
    const isMouseDown = ref(false);

    function handleMouseDown() {
        isMouseDown.value = !isMouseDown.value;
    }

    onMounted(() => {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', () => isMouseDown.value = false);
    });

    onUnmounted(() => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', () => isMouseDown.value = false);
    });

    return isMouseDown
}