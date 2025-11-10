import { ref, onMounted, onUnmounted } from 'vue'

export function useMouseHold() {
    const isMouseDown = ref(false);

    function handleMouseDown() {
        isMouseDown.value = true;
    }

    function handleMouseUp() {
        isMouseDown.value = false;
    }

    onMounted(() => {
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
    });

    onUnmounted(() => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mouseup', handleMouseUp);
    });

    return isMouseDown
}