import React from 'react';
import { useAtom } from 'jotai';
import * as Form from '@radix-ui/react-form';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import * as Select from '@radix-ui/react-select';
import { settingsAtom } from '../store/simulation';
import type { SimulationSettings } from '../types/simulation';

const ruleSets = [
  {
    id: 'default',
    name: 'Default',
    description: 'Basic simulation rules'
  },
  {
    id: 'dnd',
    name: 'D&D',
    description: 'Dungeons & Dragons style rules'
  },
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Realistic world simulation rules'
  }
];

export const SettingsForm: React.FC = () => {
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleSpeedChange = (value: number[]) => {
    setSettings({ ...settings, speed: value[0] });
  };

  const handleRatedContentChange = (checked: boolean) => {
    setSettings({ ...settings, allowRatedContent: checked });
  };

  const handleXRatedContentChange = (checked: boolean) => {
    setSettings({ ...settings, allowXRatedContent: checked });
  };

  const handleRuleSetChange = (value: string) => {
    setSettings({ ...settings, ruleSet: value });
  };

  return (
    <Form.Root className="space-y-4 p-4 bg-white rounded-lg shadow">
      <Form.Field name="speed">
        <div className="flex items-center justify-between">
          <Form.Label className="text-sm font-medium">Simulation Speed</Form.Label>
          <Form.Control asChild>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-[200px] h-5"
              value={[settings.speed]}
              onValueChange={handleSpeedChange}
              max={5}
              step={0.1}
            >
              <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-white shadow-lg rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Speed"
              />
            </Slider.Root>
          </Form.Control>
        </div>
      </Form.Field>

      <Form.Field name="ratedContent">
        <div className="flex items-center justify-between">
          <Form.Label className="text-sm font-medium">Allow Rated Content</Form.Label>
          <Form.Control asChild>
            <Switch.Root
              className="w-[42px] h-[25px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-default"
              checked={settings.allowRatedContent}
              onCheckedChange={handleRatedContentChange}
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-lg transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
            </Switch.Root>
          </Form.Control>
        </div>
      </Form.Field>

      <Form.Field name="xRatedContent">
        <div className="flex items-center justify-between">
          <Form.Label className="text-sm font-medium">Allow X-Rated Content</Form.Label>
          <Form.Control asChild>
            <Switch.Root
              className="w-[42px] h-[25px] bg-gray-200 rounded-full relative data-[state=checked]:bg-blue-500 outline-none cursor-default"
              checked={settings.allowXRatedContent}
              onCheckedChange={handleXRatedContentChange}
            >
              <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-lg transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
            </Switch.Root>
          </Form.Control>
        </div>
      </Form.Field>

      <Form.Field name="ruleSet">
        <div className="space-y-2">
          <Form.Label className="text-sm font-medium">Rule Set</Form.Label>
          <Form.Control asChild>
            <Select.Root value={settings.ruleSet} onValueChange={handleRuleSetChange}>
              <Select.Trigger className="inline-flex items-center justify-between rounded-md px-3 py-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <Select.Value />
                <Select.Icon className="ml-2">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L7.5 9.5L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg">
                  <Select.Viewport className="p-1">
                    {ruleSets.map((ruleSet) => (
                      <Select.Item
                        key={ruleSet.id}
                        value={ruleSet.id}
                        className="relative flex items-center px-8 py-2 text-sm text-gray-700 rounded-md cursor-default select-none hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                      >
                        <Select.ItemText>{ruleSet.name}</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                          </svg>
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </Form.Control>
        </div>
      </Form.Field>
    </Form.Root>
  );
}; 