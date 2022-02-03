import Element from '../components/Element.svelte';
import WithSyrinContext from './WithSyrinContext.svelte';
import { render, fireEvent } from '@testing-library/svelte';

describe("Element", () => {
    it('it plays element', async () => {
        const info = jest.fn();
        const playElement = jest.fn();

        const { getByTitle } = render(WithSyrinContext, {
            Component: Element,
            context: {
                notifications: {
                    info
                }
            },
            api: {
                playElement
            },
            element: {
                id: "1234",
                name: "Name",
                icon: "icon"
            }
        });

        const play = getByTitle("Play: Name")

        await fireEvent.click(play);

        expect(playElement).toHaveBeenCalledTimes(1);
        expect(info).toHaveBeenCalledTimes(1);

        // expect()
    });
});
